// ─────────────────────────────────────────────────────────────────────────────
// useTimer — primary hook consumed by the timer screen
//
// Single access point for all timer logic.  Components should import this
// and destructure only what they need to minimise re-render scope.
//
// Required packages (add to package.json):
//   expo-keep-awake  → npx expo install expo-keep-awake
//   expo-av          → npx expo install expo-av
//   expo-speech      → npx expo install expo-speech
// ─────────────────────────────────────────────────────────────────────────────

import { useKeepAwake } from "expo-keep-awake";
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { timerEngine } from "../engine/TimerEngine";
import { audioService } from "../services/AudioService";
import type { WODConfig } from "../types";
import {
    selectIntervalTime,
    selectPrimaryTime,
    useTimerStore,
} from "../viewmodels/timerStore";

// ─────────────────────────────────────────────────────────────────────────────

export function useTimer() {
  const store = useTimerStore();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAtRef = useRef<number | null>(null);

  // ─── Keep screen on whenever a session is active ────────────────────────────
  // expo-keep-awake activates unconditionally when the hook is rendered.
  // We conditionally mount a child component (TimerKeepAwake) in the screen
  // instead, so we only invoke this when isRunning or hasStarted is true.
  // The hook is called here for convenience but the screen gates its render.
  useKeepAwake();

  // ─── Init audio service on mount ────────────────────────────────────────────
  useEffect(() => {
    audioService.init();
    return () => {
      // Do NOT dispose here — the screen might remount during navigation.
      // Disposal is explicit on session end or app background via saveSnapshot.
    };
  }, []);

  // ─── Restore any snapshot from previous session ─────────────────────────────
  useEffect(() => {
    if (!store.hasStarted) {
      store.restoreSnapshot().then((restored) => {
        // Snapshot restored but NOT auto-resumed — athlete must consciously press Resume.
        // This prevents the timer from silently running while athlete is reading results.
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── App State handler: background / foreground ──────────────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const prevState = appStateRef.current;
        appStateRef.current = nextState;

        // App going to background
        if (prevState === "active" && nextState !== "active") {
          backgroundedAtRef.current = Date.now();
          if (store.isRunning) {
            // Save snapshot so we can restore if the OS kills the app.
            // The engine keeps ticking; expo-av audio mode keeps sounds alive.
            store.saveSnapshot();
          }
        }

        // App returning to foreground
        if (prevState !== "active" && nextState === "active") {
          if (store.isRunning && backgroundedAtRef.current !== null) {
            // Engine may have been paused by OS. Nudge it to sync elapsed time.
            // timerEngine uses wall-clock timestamps, so no correction needed —
            // the next tick will compute the correct elapsed time automatically.
            backgroundedAtRef.current = null;
          }
        }
      },
    );

    return () => subscription.remove();
  }, [store.isRunning, store]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (!store.isRunning) {
        timerEngine.dispose();
        audioService.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Stable action callbacks (prevent child re-renders) ─────────────────────

  const configure = useCallback(
    (config: WODConfig) => {
      store.configure(config);
    },
    [store],
  );

  const start = useCallback(() => store.start(), [store]);
  const pause = useCallback(() => store.pause(), [store]);
  const resume = useCallback(() => store.resume(), [store]);
  const stop = useCallback(() => store.stop(), [store]);
  const reset = useCallback(() => store.reset(), [store]);

  // ─── Derived display values ──────────────────────────────────────────────────

  const primaryTime = selectPrimaryTime(store);
  const intervalTime = selectIntervalTime(store);

  const isFinalCountdown =
    store.display.intervalRemaining !== undefined
      ? store.display.intervalRemaining <= 5
      : store.display.remainingSeconds !== undefined
        ? store.display.remainingSeconds <= 5 &&
          store.display.remainingSeconds > 0
        : false;

  const isFinalMinute =
    store.display.remainingSeconds !== undefined &&
    store.display.remainingSeconds <= 60 &&
    store.display.remainingSeconds > 5;

  return {
    // ── Status ──────────────────────────────────────────────────────────────
    isRunning: store.isRunning,
    hasStarted: store.hasStarted,
    isComplete: store.isComplete,
    config: store.config,

    // ── Display data ────────────────────────────────────────────────────────
    phase: store.display.phase,
    label: store.display.label,
    primaryTime,
    intervalTime,
    currentRound: store.display.currentRound,
    totalRounds: store.display.totalRounds,
    elapsedSeconds: store.display.elapsedSeconds,
    remainingSeconds: store.display.remainingSeconds,

    // ── Derived UI flags ────────────────────────────────────────────────────
    isFinalCountdown,
    isFinalMinute,

    // ── Actions ─────────────────────────────────────────────────────────────
    configure,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}

export type UseTimerReturn = ReturnType<typeof useTimer>;
