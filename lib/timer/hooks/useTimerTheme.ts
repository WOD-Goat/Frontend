// ─────────────────────────────────────────────────────────────────────────────
// useTimerTheme — derives visual theme from current timer phase
//
// Color system:
//   IDLE      → Dark background, neutral text
//   COUNTDOWN → Warning yellow — signals imminent start
//   WORK      → Primary orange — athletic energy
//   REST      → Near-white on dark — calm recovery
//   COMPLETE  → Success green — celebration
//   FINAL_5s  → Flash between current phase color and red — urgency
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import type { TimerPhase, TimerTheme } from "../types";

// ─── Phase palette ────────────────────────────────────────────────────────────
// Aligned with the existing WODGoat Colors.ts design system

const PHASE_THEMES: Record<TimerPhase, TimerTheme> = {
  IDLE: {
    background: "#1C1C1E",
    primaryText: "#E6EDF3",
    secondaryText: "#8E8E93",
    flashColor: "#FF3B30",
  },
  COUNTDOWN: {
    background: "#1C0E00", // Very dark orange-tinted
    primaryText: "#FF6B2C", // warning.500
    secondaryText: "#FF6B2C",
    flashColor: "#FF3B30",
  },
  WORK: {
    background: "#1C0B00", // Very dark orange-tinted
    primaryText: "#FF6B2C", // primary.500
    secondaryText: "#E65724",
    flashColor: "#FF3B30",
  },
  REST: {
    background: "#16161A", // Very dark neutral
    primaryText: "#EBEBF0", // near-white
    secondaryText: "#A0A0AA", // medium grey
    flashColor: "#FF3B30",
  },
  COMPLETE: {
    background: "#001A00", // Very dark green-tinted
    primaryText: "#34C759", // success.500
    secondaryText: "#2A9F47",
    flashColor: "#34C759",
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTimerTheme(
  phase: TimerPhase,
  isFinalCountdown: boolean,
): {
  theme: TimerTheme;
  flashAnim: Animated.Value;
  isFlashing: boolean;
} {
  const theme = useMemo(
    () => PHASE_THEMES[phase] ?? PHASE_THEMES.IDLE,
    [phase],
  );

  // Flash animation — only active in final 5 seconds of a phase
  const flashAnim = useRef(new Animated.Value(0)).current;
  const flashLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (isFinalCountdown) {
      setIsFlashing(true);
      flashLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      );
      flashLoopRef.current.start();
    } else {
      flashLoopRef.current?.stop();
      flashLoopRef.current = null;
      flashAnim.setValue(0);
      setIsFlashing(false);
    }

    return () => {
      flashLoopRef.current?.stop();
    };
  }, [isFinalCountdown, flashAnim]);

  return { theme, flashAnim, isFlashing };
}
