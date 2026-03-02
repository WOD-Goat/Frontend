// ─────────────────────────────────────────────────────────────────────────────
// AUDIO SERVICE
//
// Responsibilities:
//  - Configure the audio session ONCE at app boot for background + silent mode.
//  - Preload all sound effects into memory so playback is instant.
//  - Debounce / deduplicate overlapping sounds.
//  - Route TTS through expo-speech with priority queuing.
//  - Never throw — audio failures must be silent; the timer must keep running.
//
// Required packages (add to package.json):
//   expo-av          → npx expo install expo-av
//   expo-speech      → npx expo install expo-speech
// ─────────────────────────────────────────────────────────────────────────────

import type { AVPlaybackSource } from "expo-av";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import * as Speech from "expo-speech";
import type { AudioEvent, SoundCueId } from "../types";

// ─── Sound asset map ──────────────────────────────────────────────────────────
// All files live in assets/sounds/timer/
// Use short mono WAV or AAC files (<100 KB each) to keep load time minimal.

const SOUND_ASSETS: Record<SoundCueId, AVPlaybackSource> = {
  beep_countdown:
    require("../../../assets/sounds/timer/beep_countdown.wav") as AVPlaybackSource,
  beep_go:
    require("../../../assets/sounds/timer/beep_go.wav") as AVPlaybackSource,
  beep_warning:
    require("../../../assets/sounds/timer/beep_warning.wav") as AVPlaybackSource,
  horn_start:
    require("../../../assets/sounds/timer/horn_start.wav") as AVPlaybackSource,
  horn_end:
    require("../../../assets/sounds/timer/horn_end.wav") as AVPlaybackSource,
  buzzer_transition:
    require("../../../assets/sounds/timer/buzzer_transition.wav") as AVPlaybackSource,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AudioServiceState {
  isReady: boolean;
  sounds: Partial<Record<SoundCueId, Audio.Sound>>;
  /** Epoch ms of the last time each sound was played. Prevents rapid-fire repeats. */
  lastPlayed: Partial<Record<SoundCueId, number>>;
  isSpeaking: boolean;
  ttsPriorityQueue: Array<{ text: string; priority: number }>;
}

// ─── SERVICE CLASS ────────────────────────────────────────────────────────────

class AudioService {
  private state: AudioServiceState = {
    isReady: false,
    sounds: {},
    lastPlayed: {},
    isSpeaking: false,
    ttsPriorityQueue: [],
  };

  // Minimum ms between identical sound effects (prevents double-fire on rapid ticks)
  private readonly DEBOUNCE_MS = 150;

  // ─── Initialization ─────────────────────────────────────────────────────────

  /**
   * Call once, early in the timer feature's mount lifecycle (not at app boot,
   * to avoid unnecessary overhead on screens that don't use the timer).
   *
   * Audio session config:
   *  - `staysActiveInBackground: true`  → keeps playback alive when screen locks
   *  - `playsInSilentModeIOS: true`     → overrides iOS silent/ringer switch
   *  - `interruptionModeIOS: DoNotMix`  → don't duck other apps; fully take over
   *  - `shouldDuckAndroid: false`       → same for Android
   */
  async init(): Promise<void> {
    if (this.state.isReady) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      await this._preloadSounds();
      this.state.isReady = true;
    } catch (err) {
      // Non-fatal: timer still works, just muted
      console.warn("[AudioService] init failed:", err);
    }
  }

  /** Release all Sound objects. Call on timer screen unmount. */
  async dispose(): Promise<void> {
    for (const sound of Object.values(this.state.sounds)) {
      try {
        await sound?.unloadAsync();
      } catch (_) {}
    }
    this.state.sounds = {};
    this.state.isReady = false;
    this.state.ttsPriorityQueue = [];
    this.state.isSpeaking = false;
    Speech.stop();
  }

  // ─── Event processing ───────────────────────────────────────────────────────

  /**
   * Process a batch of AudioEvents emitted by the engine in a single tick.
   * Called by the store/hook on every tick — must be fast and non-blocking.
   */
  processEvents(events: AudioEvent[]): void {
    if (!this.state.isReady) return;
    if (events.length === 0) return;

    // Split and process in priority order
    const sounds = events.filter((e) => e.type === "SOUND");
    const ttsEvents = events.filter((e) => e.type === "TTS");

    // Play sounds immediately (fire and forget)
    for (const event of sounds) {
      if (event.soundId) this._playSound(event.soundId);
    }

    // Queue TTS by priority (higher priority wins)
    if (ttsEvents.length > 0) {
      const highest = ttsEvents.reduce((prev, curr) =>
        (curr.priority ?? 0) > (prev.priority ?? 0) ? curr : prev,
      );
      if (highest.text) this._enqueueTTS(highest.text, highest.priority ?? 0);
    }
  }

  // ─── Sound playback ─────────────────────────────────────────────────────────

  private async _playSound(id: SoundCueId): Promise<void> {
    const now = Date.now();
    const lastPlayed = this.state.lastPlayed[id] ?? 0;

    if (now - lastPlayed < this.DEBOUNCE_MS) return;
    this.state.lastPlayed[id] = now;

    const sound = this.state.sounds[id];
    if (!sound) return;

    try {
      // Rewind to start so rapid re-triggers work correctly
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (err) {
      console.warn(`[AudioService] failed to play ${id}:`, err);
    }
  }

  // ─── TTS ────────────────────────────────────────────────────────────────────

  /**
   * Priority queue: if a higher-priority announcement comes in while TTS is
   * speaking, interrupt and speak the new one. Same or lower priority: discard.
   */
  private _currentTTSPriority = -1;

  private _enqueueTTS(text: string, priority: number): void {
    if (this.state.isSpeaking && priority <= this._currentTTSPriority) return;

    if (this.state.isSpeaking) {
      Speech.stop();
    }

    this._currentTTSPriority = priority;
    this.state.isSpeaking = true;

    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9, // Slightly slower for clarity during exertion
      onDone: () => {
        this.state.isSpeaking = false;
        this._currentTTSPriority = -1;
      },
      onStopped: () => {
        this.state.isSpeaking = false;
        this._currentTTSPriority = -1;
      },
      onError: () => {
        this.state.isSpeaking = false;
        this._currentTTSPriority = -1;
      },
    });
  }

  // ─── Preload ─────────────────────────────────────────────────────────────────

  private async _preloadSounds(): Promise<void> {
    const entries = Object.entries(SOUND_ASSETS) as [
      SoundCueId,
      AVPlaybackSource,
    ][];

    await Promise.allSettled(
      entries.map(async ([id, asset]) => {
        try {
          const { sound } = await Audio.Sound.createAsync(asset, {
            shouldPlay: false,
            volume: 1.0,
          });
          this.state.sounds[id] = sound;
        } catch (err) {
          console.warn(`[AudioService] failed to preload ${id}:`, err);
        }
      }),
    );
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
export const audioService = new AudioService();
