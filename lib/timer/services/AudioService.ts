// ─────────────────────────────────────────────────────────────────────────────
// AUDIO SERVICE
//
// Responsibilities:
//  - Configure the audio session ONCE at app boot for background + silent mode.
//  - Preload all sound effects into memory so playback is instant.
//  - Debounce / deduplicate overlapping sounds.
//  - Play pre-generated voice clips with priority queuing (no device TTS;
//    text with no clip is silent).
//  - Keep the JS runtime alive in the background with a silent looping track.
//  - Never throw — audio failures must be silent; the timer must keep running.
//
// Required packages (add to package.json):
//   expo-audio       → npx expo install expo-audio
// ─────────────────────────────────────────────────────────────────────────────

import type { AudioPlayer } from "expo-audio";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioEvent, SoundCueId } from "../types";

// ─── Sound asset map ──────────────────────────────────────────────────────────
// All files live in assets/sounds/timer/
// Use short mono WAV or AAC files (<100 KB each) to keep load time minimal.

// Inaudible loop played while the timer runs so the OS keeps JS alive in the
// background. Mixes with other audio, so the user's music is not interrupted.
const KEEPALIVE_ASSET: number = require("../../../assets/sounds/timer/silence.wav");

const SOUND_ASSETS: Record<SoundCueId, number> = {
  beep_go: require("../../../assets/sounds/timer/beep_go.wav"),
  beep_warning: require("../../../assets/sounds/timer/beep_warning.wav"),
  horn_start: require("../../../assets/sounds/timer/horn_start.wav"),
  horn_end: require("../../../assets/sounds/timer/horn_end.wav"),
};

// ─── Pre-generated voice clips ────────────────────────────────────────────────
// Keyed by the exact text the engine emits in TTS events. Any text not listed
// here (e.g. "Round 3", custom block labels) is silent until a clip is added.
const VOICE_ASSETS: Record<string, number> = {
  "Get Ready": require("../../../assets/audio/Get Ready.mp3"),
  "1": require("../../../assets/audio/1.mp3"),
  "2": require("../../../assets/audio/2.mp3"),
  "3": require("../../../assets/audio/3.mp3"),
  "4": require("../../../assets/audio/4.mp3"),
  "5": require("../../../assets/audio/5.mp3"),
  "10": require("../../../assets/audio/10.mp3"),
  "Halfway!": require("../../../assets/audio/Halfway There.mp3"),
  "One minute remaining": require("../../../assets/audio/1 min Remaining.mp3"),
  "Time cap! Great work!": require("../../../assets/audio/Time Cap Well Done Champ.mp3"),
  "Time! Stop where you are.": require("../../../assets/audio/Time Out Well Done Champ.mp3"),
  "EMOM complete. Well done!": require("../../../assets/audio/Time Up Catch Your Breath You Earned It.mp3"),
  "Tabata complete!": require("../../../assets/audio/Workout Completed.mp3"),
  "Workout complete!": require("../../../assets/audio/Workout Completed.mp3"),
  "Work!": require("../../../assets/audio/Lets Go.mp3"),
  "Next Round": require("../../../assets/audio/Next Round.mp3"),
  "Next Minute": require("../../../assets/audio/Next Minute.mp3"),
  Rest: require("../../../assets/audio/Rest.mp3"),
};

// TEMP: set false (or delete the dbg() calls) once dropped cues are fixed.
const DEBUG_AUDIO = false;
const dbg = (msg: string): void => {
  if (DEBUG_AUDIO) console.log(`[audio ${Date.now() % 100000}] ${msg}`);
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AudioServiceState {
  isReady: boolean;
  sounds: Partial<Record<SoundCueId, AudioPlayer>>;
  voices: Record<string, AudioPlayer>;
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
    voices: {},
    lastPlayed: {},
    isSpeaking: false,
    ttsPriorityQueue: [],
  };

  // Minimum ms between identical sound effects (prevents double-fire on rapid ticks)
  private readonly DEBOUNCE_MS = 150;

  // ─── Initialization ─────────────────────────────────────────────────────────

  private _initPromise: Promise<void> | null = null;

  /**
   * Call once, early in the timer feature's mount lifecycle (not at app boot,
   * to avoid unnecessary overhead on screens that don't use the timer).
   *
   * Audio session config:
   *  - `staysActiveInBackground: true`  → keeps playback alive when screen locks
   *  - `playsInSilentModeIOS: true`     → overrides iOS silent/ringer switch
   *  - `interruptionMode: mixWithOthers` → cues play over the user's music
   *    without lowering or pausing it (no ducking).
   */
  async init(): Promise<void> {
    if (this.state.isReady) return;
    // Single-flight: concurrent callers (e.g. start handler + overlay mount)
    // share one init so players are never preloaded twice.
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: "mixWithOthers",
        });

        this._preloadSounds();
        this._preloadVoices();
        this.state.isReady = true;
      } catch (err) {
        // Non-fatal: timer still works, just muted
        console.warn("[AudioService] init failed:", err);
      } finally {
        this._initPromise = null;
      }
    })();
    return this._initPromise;
  }

  /**
   * Reset TTS state between sessions.
   * Stops any in-flight speech and clears the stuck-speaking guard so a new
   * session never inherits a stale isSpeaking=true from the previous one.
   */
  reset(): void {
    this.stopKeepAlive();
    this._stopVoice();
    // Silence and rewind every beep and voice clip so nothing from the
    // previous timer is still playing or left mid-clip.
    for (const player of [
      ...Object.values(this.state.sounds),
      ...Object.values(this.state.voices),
    ]) {
      try {
        player?.pause();
        player?.seekTo(0);
      } catch (_) {}
    }
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
    for (const player of Object.values(this.state.voices)) {
      try {
        player.remove();
      } catch (_) {}
    }
    this.state.voices = {};
    this._voicePlayer = null;
    this.state.isReady = false;
    this.state.ttsPriorityQueue = [];
    this.state.isSpeaking = false;
    this.stopKeepAlive();
    try {
      this._keepAlive?.remove();
    } catch (_) {}
    this._keepAlive = null;
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
      for (const e of ttsEvents) {
        if (e !== highest) {
          dbg(`skip "${e.text}" (p${e.priority ?? 0}): outranked in same batch by "${highest.text}" (p${ttsPriority})`);
        }
      }
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

    if (now - lastPlayed < this.DEBOUNCE_MS) {
      dbg(`skip ${id}: debounce (${now - lastPlayed}ms)`);
      return;
    }
    this.state.lastPlayed[id] = now;

    const player = this.state.sounds[id];
    if (!player) {
      dbg(`skip ${id}: player not loaded`);
      return;
    }

    try {
      // Rewind to start so rapid re-triggers work correctly.
      // Fire-and-forget seekTo — don't await it; the player handles
      // the seek+play sequence internally and awaiting adds latency.
      player.seekTo(0);
      player.volume = 1.0;
      player.play();
      dbg(`play ${id}`);
    } catch (err) {
      dbg(`fail ${id}: ${String(err)}`);
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

  private _voicePlayer: AudioPlayer | null = null;

  private _stopVoice(): void {
    const p = this._voicePlayer;
    this._voicePlayer = null;
    if (!p) return;
    try {
      p.pause();
      p.seekTo(0);
    } catch (_) {}
  }

  private _enqueueTTS(text: string, priority: number): void {
    // No clip for this text → stay silent (and don't interrupt anything).
    const clip = this.state.voices[text];
    if (!clip) {
      dbg(`skip "${text}": no clip`);
      return;
    }

    if (this.state.isSpeaking && priority < this._currentTTSPriority) {
      dbg(`skip "${text}" (p${priority}): lower than playing p${this._currentTTSPriority}`);
      return;
    }

    if (this.state.isSpeaking) this._stopVoice();

    this._currentTTSPriority = priority;
    this.state.isSpeaking = true;

    try {
      this._voicePlayer = clip;
      clip.seekTo(0);
      clip.volume = 1.0;
      clip.play();
      dbg(`play "${text}" (p${priority})`);
    } catch (err) {
      dbg(`fail "${text}": ${String(err)}`);
      console.warn(`[AudioService] voice clip failed for "${text}":`, err);
      this._voicePlayer = null;
      this.state.isSpeaking = false;
      this._currentTTSPriority = -1;
    }
  }

  // ─── Background keep-alive ──────────────────────────────────────────────────

  private _keepAlive: AudioPlayer | null = null;

  private _keepAliveStopTimer: ReturnType<typeof setTimeout> | null = null;

  /** Call when the timer starts or resumes. Safe to call repeatedly. */
  startKeepAlive(): void {
    this._cancelKeepAliveStop();
    if (!this.state.isReady) return;
    try {
      if (!this._keepAlive) {
        this._keepAlive = createAudioPlayer(KEEPALIVE_ASSET);
        this._keepAlive.loop = true;
        this._keepAlive.volume = 0;
      }
      this._keepAlive.play();
    } catch (err) {
      console.warn("[AudioService] keep-alive failed:", err);
    }
  }

  /**
   * Call on pause, stop, reset and completion.
   * On completion pass a delay: pausing the loop in the same instant the ending
   * horn/voice start made them inaudible, so let those finish first.
   */
  stopKeepAlive(delayMs = 0): void {
    this._cancelKeepAliveStop();
    if (delayMs > 0) {
      this._keepAliveStopTimer = setTimeout(() => {
        this._keepAliveStopTimer = null;
        this.stopKeepAlive();
      }, delayMs);
      return;
    }
    try {
      this._keepAlive?.pause();
    } catch (_) {}
  }

  private _cancelKeepAliveStop(): void {
    if (this._keepAliveStopTimer) {
      clearTimeout(this._keepAliveStopTimer);
      this._keepAliveStopTimer = null;
    }
  }

  // ─── Preload ─────────────────────────────────────────────────────────────────

  private _preloadVoices(): void {
    for (const [text, asset] of Object.entries(VOICE_ASSETS)) {
      try {
        const player = createAudioPlayer(asset);
        player.volume = 1.0;
        player.addListener("playbackStatusUpdate", (status) => {
          if (status.didJustFinish) {
            // Rewind now so the next play() starts instantly with no seek race.
            try {
              player.seekTo(0);
            } catch (_) {}
          }
          if (status.didJustFinish && this._voicePlayer === player) {
            this._voicePlayer = null;
            this.state.isSpeaking = false;
            this._currentTTSPriority = -1;
          }
        });
        this.state.voices[text] = player;
      } catch (err) {
        console.warn(`[AudioService] failed to preload voice "${text}":`, err);
      }
    }
  }

  private _preloadSounds(): void {
    const entries = Object.entries(SOUND_ASSETS) as [SoundCueId, number][];

    for (const [id, asset] of entries) {
      try {
        const player = createAudioPlayer(asset);
        player.volume = 1.0;
        player.addListener("playbackStatusUpdate", (status) => {
          if (status.didJustFinish) {
            // Rewind now so the next play() starts instantly with no seek race.
            try {
              player.seekTo(0);
            } catch (_) {}
          }
        });
        this.state.sounds[id] = player;
      } catch (err) {
        console.warn(`[AudioService] failed to preload ${id}:`, err);
      }
    }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
export const audioService = new AudioService();
