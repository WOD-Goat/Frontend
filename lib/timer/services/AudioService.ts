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
//   expo-audio       → npx expo install expo-audio
//   expo-speech      → npx expo install expo-speech
// ─────────────────────────────────────────────────────────────────────────────

import type { AudioPlayer } from "expo-audio";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Speech from "expo-speech";
import type { AudioEvent, SoundCueId } from "../types";

// ─── Sound asset map ──────────────────────────────────────────────────────────
// All files live in assets/sounds/timer/
// Use short mono WAV or AAC files (<100 KB each) to keep load time minimal.

const SOUND_ASSETS: Record<SoundCueId, number> = {
  beep_countdown: require("../../../assets/sounds/timer/beep_countdown.wav"),
  beep_go: require("../../../assets/sounds/timer/beep_go.wav"),
  beep_warning: require("../../../assets/sounds/timer/beep_warning.wav"),
  horn_start: require("../../../assets/sounds/timer/horn_start.wav"),
  horn_end: require("../../../assets/sounds/timer/horn_end.wav"),
  buzzer_transition: require("../../../assets/sounds/timer/buzzer_transition.wav"),
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AudioServiceState {
  isReady: boolean;
  sounds: Partial<Record<SoundCueId, AudioPlayer>>;
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
   *  - `interruptionModeIOS: DuckOthers` → lowers background music for our beeps
   *  - `shouldDuckAndroid: true`         → same for Android
   */
  async init(): Promise<void> {
    if (this.state.isReady) return;

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });

      this._preloadSounds();
      this.state.isReady = true;
    } catch (err) {
      // Non-fatal: timer still works, just muted
      console.warn("[AudioService] init failed:", err);
    }
  }

  /**
   * Reset TTS state between sessions.
   * Stops any in-flight speech and clears the stuck-speaking guard so a new
   * session never inherits a stale isSpeaking=true from the previous one.
   */
  reset(): void {
    Speech.stop();
    this.state.isSpeaking = false;
    this._currentTTSPriority = -1;
    this.state.ttsPriorityQueue = [];
    this.state.lastPlayed = {};
  }

  /** Release all Sound objects. Call on timer screen unmount. */
  async dispose(): Promise<void> {
    for (const player of Object.values(this.state.sounds)) {
      try {
        player?.remove();
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

    // Split into sounds and TTS
    const sounds = events.filter((e) => e.type === "SOUND");
    const ttsEvents = events.filter((e) => e.type === "TTS");

    // Pick highest-priority TTS (if any)
    let ttsText: string | null = null;
    let ttsPriority = 0;
    if (ttsEvents.length > 0) {
      const highest = ttsEvents.reduce((prev, curr) =>
        (curr.priority ?? 0) > (prev.priority ?? 0) ? curr : prev,
      );
      ttsText = highest.text ?? null;
      ttsPriority = highest.priority ?? 0;
    }

    // Play sounds immediately (fire and forget)
    for (const event of sounds) {
      if (event.soundId) this._playSound(event.soundId);
    }

    // Queue TTS by priority (higher priority wins)
    if (ttsText) this._enqueueTTS(ttsText, ttsPriority);
  }

  // ─── Sound playback ─────────────────────────────────────────────────────────

  private async _playSound(id: SoundCueId): Promise<void> {
    const now = Date.now();
    const lastPlayed = this.state.lastPlayed[id] ?? 0;

    if (now - lastPlayed < this.DEBOUNCE_MS) return;
    this.state.lastPlayed[id] = now;

    const player = this.state.sounds[id];
    if (!player) return;

    try {
      // Rewind to start so rapid re-triggers work correctly.
      // Fire-and-forget seekTo — don't await it; the player handles
      // the seek+play sequence internally and awaiting adds latency.
      player.seekTo(0);
      player.volume = 1.0;
      player.play();
    } catch (err) {
      console.warn(`[AudioService] failed to play ${id}:`, err);
    }
  }

  // ─── TTS ────────────────────────────────────────────────────────────────────

  /**
   * Priority queue: if an equal-or-higher-priority announcement comes in while
   * TTS is speaking, interrupt and speak the new one. Lower priority: discard.
   * This ensures rapid-fire countdown numbers (3 → 2 → 1) always replace each
   * other instead of being silently dropped.
   */
  private _currentTTSPriority = -1;

  private _enqueueTTS(text: string, priority: number): void {
    if (this.state.isSpeaking && priority < this._currentTTSPriority) return;

    if (this.state.isSpeaking) {
      Speech.stop();
    }

    this._currentTTSPriority = priority;
    this.state.isSpeaking = true;

    // Short utterances (single digits, "Go!") use a faster rate so they
    // finish well within one second and never overlap the next cue.
    const isShort = text.length <= 3;

    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: isShort ? 1.1 : 0.9,
      volume: 1.0, // Maximum volume for noisy environments
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

  private _preloadSounds(): void {
    const entries = Object.entries(SOUND_ASSETS) as [SoundCueId, number][];

    for (const [id, asset] of entries) {
      try {
        const player = createAudioPlayer(asset);
        player.volume = 1.0;
        this.state.sounds[id] = player;
      } catch (err) {
        console.warn(`[AudioService] failed to preload ${id}:`, err);
      }
    }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
export const audioService = new AudioService();
