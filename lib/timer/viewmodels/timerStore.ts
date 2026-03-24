// ─────────────────────────────────────────────────────────────────────────────
// TIMER VIEW-MODEL (Zustand Store)
//
// This is the single source of truth for ALL timer state visible to the UI.
//
// MVVM responsibilities:
//  - ViewModel (this file) receives TickResults from the engine.
//  - It transforms raw engine data into display-ready values.
//  - It calls the AudioService with audio events.
//  - It persists/restores snapshots via AsyncStorage.
//  - The UI only reads from this store — never touches the engine directly.
//
// State update frequency:
//  - The engine ticks at 100 ms but we only update display state once per
//    SECOND (or on phase change) to avoid re-rendering every 100 ms.
//  - Audio events are still processed on every tick regardless of display throttle.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { timerEngine } from "../engine/TimerEngine";
import { audioService } from "../services/AudioService";
import type {
    TickResult,
    TimerPhase,
    TimerSnapshot,
    WODConfig
} from "../types";

// ─── Storage key ──────────────────────────────────────────────────────────────

const SNAPSHOT_KEY = "@wodgoat/timer_snapshot";
const SNAPSHOT_VERSION = 1;

// ─── Display state (throttled — drives React renders) ─────────────────────────

interface TimerDisplayState {
  phase: TimerPhase;
  elapsedSeconds: number;
  remainingSeconds: number | undefined;
  currentRound: number;
  totalRounds: number | undefined;
  intervalRemaining: number | undefined;
  label: string;
  isComplete: boolean;
}

// ─── Full store shape ─────────────────────────────────────────────────────────

export interface TimerStore {
  // ─── Configuration ─────────────────────────────────────────────────────────
  config: WODConfig | null;

  // ─── Session status ─────────────────────────────────────────────────────────
  isRunning: boolean;
  hasStarted: boolean;
  isComplete: boolean;

  // ─── Display (throttled at 1 Hz or on phase change) ─────────────────────────
  display: TimerDisplayState;

  // ─── Accumulated ms (used for pause/resume drift correction) ────────────────
  accumulatedMs: number;

  // ─── Actions ────────────────────────────────────────────────────────────────
  configure: (config: WODConfig) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;

  // ─── Persistence ────────────────────────────────────────────────────────────
  saveSnapshot: () => Promise<void>;
  restoreSnapshot: () => Promise<boolean>;
  clearSnapshot: () => Promise<void>;

  // ─── FAB trigger (tab bar → setup screen) ───────────────────────────────────
  pendingConfirm: boolean;
  requestConfirm: () => void;
  clearConfirm: () => void;
}

// ─── Initial display ──────────────────────────────────────────────────────────

const initialDisplay: TimerDisplayState = {
  phase: "IDLE",
  elapsedSeconds: 0,
  remainingSeconds: undefined,
  currentRound: 0,
  totalRounds: undefined,
  intervalRemaining: undefined,
  label: "Ready",
  isComplete: false,
};

// ─── Throttle logic ───────────────────────────────────────────────────────────

let _lastDisplayUpdateSecond = -1;
let _lastDisplayPhase: TimerPhase = "IDLE";

function shouldUpdateDisplay(result: TickResult): boolean {
  const currentSecond = Math.floor(result.elapsedSeconds);
  // Always update on phase change
  if (result.phase !== _lastDisplayPhase) {
    _lastDisplayPhase = result.phase;
    _lastDisplayUpdateSecond = currentSecond;
    return true;
  }
  // Always update when complete
  if (result.isComplete) return true;
  // Otherwise throttle to once per second
  if (currentSecond !== _lastDisplayUpdateSecond) {
    _lastDisplayUpdateSecond = currentSecond;
    return true;
  }
  return false;
}

// ─── STORE ────────────────────────────────────────────────────────────────────

export const useTimerStore = create<TimerStore>((set, get) => ({
  config: null,
  isRunning: false,
  hasStarted: false,
  isComplete: false,
  display: initialDisplay,
  accumulatedMs: 0,
  pendingConfirm: false,
  requestConfirm: () => set({ pendingConfirm: true }),
  clearConfirm: () => set({ pendingConfirm: false }),

  // ─── Configure a new WOD ──────────────────────────────────────────────────

  configure(config: WODConfig) {
    // Reset throttle state
    _lastDisplayUpdateSecond = -1;
    _lastDisplayPhase = "IDLE";

    timerEngine.configure(config, (result: TickResult) => {
      // ── Audio: always process, every tick ──────────────────────────────────
      audioService.processEvents(result.audioEvents);

      // ── Display: throttled to 1 Hz (or phase change) ───────────────────────
      if (!shouldUpdateDisplay(result)) return;

      set({
        isComplete: result.isComplete,
        display: {
          phase: result.phase,
          elapsedSeconds: result.elapsedSeconds,
          remainingSeconds: result.remainingSeconds,
          currentRound: result.currentRound,
          totalRounds: result.totalRounds,
          intervalRemaining: result.intervalRemaining,
          label: result.label,
          isComplete: result.isComplete,
        },
      });

      if (result.isComplete) {
        set({ isRunning: false });
        get().clearSnapshot();
      }
    });

    set({
      config,
      isRunning: false,
      hasStarted: false,
      isComplete: false,
      accumulatedMs: 0,
      display: initialDisplay,
    });
  },

  // ─── Start ────────────────────────────────────────────────────────────────

  start() {
    if (!get().config) return;
    timerEngine.start();
    set({ isRunning: true, hasStarted: true });
  },

  // ─── Pause ────────────────────────────────────────────────────────────────

  pause() {
    const accumulated = timerEngine.pause();
    set({ isRunning: false, accumulatedMs: accumulated });
    get().saveSnapshot();
  },

  // ─── Resume ───────────────────────────────────────────────────────────────

  resume() {
    const { accumulatedMs, config } = get();
    if (!config) return;

    // Re-attach the same onTick callback (engine callback ref is stable)
    timerEngine.resume(accumulatedMs, (result: TickResult) => {
      audioService.processEvents(result.audioEvents);
      if (!shouldUpdateDisplay(result)) return;
      set({
        isComplete: result.isComplete,
        display: {
          phase: result.phase,
          elapsedSeconds: result.elapsedSeconds,
          remainingSeconds: result.remainingSeconds,
          currentRound: result.currentRound,
          totalRounds: result.totalRounds,
          intervalRemaining: result.intervalRemaining,
          label: result.label,
          isComplete: result.isComplete,
        },
      });
      if (result.isComplete) {
        set({ isRunning: false });
        get().clearSnapshot();
      }
    });

    set({ isRunning: true });
  },

  // ─── Stop ─────────────────────────────────────────────────────────────────

  stop() {
    timerEngine.stop();
    set({ isRunning: false });
    get().clearSnapshot();
  },

  // ─── Reset ────────────────────────────────────────────────────────────────

  reset() {
    timerEngine.stop();
    _lastDisplayUpdateSecond = -1;
    _lastDisplayPhase = "IDLE";
    set({
      isRunning: false,
      hasStarted: false,
      isComplete: false,
      accumulatedMs: 0,
      display: initialDisplay,
    });
    // Re-configure fresh if config exists
    const config = get().config;
    if (config) {
      get().configure(config);
    }
  },

  // ─── Snapshot persistence ─────────────────────────────────────────────────

  async saveSnapshot() {
    const { config, display, accumulatedMs } = get();
    if (!config || !get().hasStarted) return;
    try {
      const snapshot: TimerSnapshot = {
        config,
        timerState: {
          hasStarted: true,
          phase: display.phase,
          elapsedSeconds: display.elapsedSeconds,
          remainingSeconds: display.remainingSeconds,
          currentRound: display.currentRound,
          totalRounds: display.totalRounds,
          intervalRemaining: display.intervalRemaining,
          label: display.label,
          accumulatedMs,
          pausedAt: Date.now(),
        },
        version: SNAPSHOT_VERSION,
      };
      await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch (err) {
      console.warn("[TimerStore] snapshot save failed:", err);
    }
  },

  async restoreSnapshot(): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
      if (!raw) return false;

      const snapshot: TimerSnapshot = JSON.parse(raw);
      if (snapshot.version !== SNAPSHOT_VERSION) {
        await AsyncStorage.removeItem(SNAPSHOT_KEY);
        return false;
      }

      const { config, timerState } = snapshot;

      // Reconfigure engine with the restored config
      get().configure(config);

      // Restore accumulated ms (paused time + time since snapshot)
      const timeSincePause = Date.now() - timerState.pausedAt;
      const restoredMs = timerState.accumulatedMs + timeSincePause;

      set({
        hasStarted: true,
        isComplete: false,
        accumulatedMs: restoredMs,
        display: {
          phase: timerState.phase,
          elapsedSeconds: timerState.elapsedSeconds,
          remainingSeconds: timerState.remainingSeconds,
          currentRound: timerState.currentRound,
          totalRounds: timerState.totalRounds,
          intervalRemaining: timerState.intervalRemaining,
          label: timerState.label,
          isComplete: false,
        },
      });

      return true;
    } catch (err) {
      console.warn("[TimerStore] snapshot restore failed:", err);
      return false;
    }
  },

  async clearSnapshot() {
    try {
      await AsyncStorage.removeItem(SNAPSHOT_KEY);
    } catch (_) {}
  },
}));

// ─── Selectors (memoised access patterns for UI) ──────────────────────────────

/** Returns the display-ready MM:SS string for the primary clock face. */
export function selectPrimaryTime(store: TimerStore): string {
  const { display, config } = store;

  // Countdown modes: show remaining
  if (display.remainingSeconds !== undefined) {
    return formatSeconds(display.remainingSeconds);
  }

  return formatSeconds(display.elapsedSeconds);
}

/** Returns the interval countdown (EMOM/TABATA/CUSTOM secondary clock). */
export function selectIntervalTime(store: TimerStore): string | null {
  const { display } = store;
  if (display.intervalRemaining === undefined) return null;
  return formatSeconds(display.intervalRemaining);
}

function formatSeconds(s: number): string {
  const total = Math.max(0, Math.floor(s));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
