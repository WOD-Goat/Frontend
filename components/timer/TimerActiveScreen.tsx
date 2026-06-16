// ─────────────────────────────────────────────────────────────────────────────
// TimerActiveScreen — full-screen running clock
//
// Mounted at:  app/timer/active.tsx
// The tab bar is hidden at the stack-screen level (see app/timer/_layout.tsx).
// State is read straight from the shared Zustand store — no props needed.
//
// The phase-tinted (and optionally flashing) background is owned HERE so it
// covers every pixel — header, clock, and controls as one unified surface.
// ─────────────────────────────────────────────────────────────────────────────

import { useTimer } from "@/lib/timer/hooks/useTimer";
import { useTimerTheme } from "@/lib/timer/hooks/useTimerTheme";
import { FontFamilies, responsiveSize } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  Animated,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TimerControls } from "./TimerControls";
import { TimerDisplay } from "./TimerDisplay";

// ─── Phase → accent colour (buttons) ─────────────────────────────────────────

const PHASE_ACCENT: Record<string, string> = {
  IDLE: "#FF6B2C",
  COUNTDOWN: "#FF6B2C",
  WORK: "#FF6B2C",
  REST: "#EBEBF0",
  COMPLETE: "#34C759",
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TimerActiveScreen() {
  const timer = useTimer();
  const insets = useSafeAreaInsets();
  const { theme, flashAnim, isFlashing } = useTimerTheme(
    timer.phase,
    timer.isFinalCountdown,
  );

  const accentColor = PHASE_ACCENT[timer.phase] ?? "#FF6B2C";

  // Animated background: flashes between phase color and flash color in final 5s
  const animatedBg = isFlashing
    ? (flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.background, theme.flashColor],
      }) as unknown as string)
    : theme.background;

  const handleStop = () => {
    timer.stop();
    router.back();
  };

  // Android hardware back button → stop timer and go back
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      timer.stop();
      router.back();
      return true; // prevent default back navigation
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    timer.reset();
  };

  return (
    <Animated.View
      style={[
        styles.screen,
        {
          backgroundColor: animatedBg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header — "‹ CHANGE MODE" shown only while paused */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          {!timer.isRunning && !timer.isComplete && (
            <TouchableOpacity style={styles.changeMode} onPress={handleStop}>
              <Ionicons name="close" size={responsiveSize(18)} color="#f00" />
              <Text style={styles.changeModeText}> Discard</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Clock face */}
      <TimerDisplay
        primaryTime={timer.primaryTime}
        intervalTime={timer.intervalTime}
        label={timer.label}
        currentRound={timer.currentRound}
        totalRounds={timer.totalRounds}
        isComplete={timer.isComplete}
        theme={theme}
      />

      {/* Action buttons */}
      <TimerControls
        isRunning={timer.isRunning}
        hasStarted={timer.hasStarted}
        isComplete={timer.isComplete}
        onStart={timer.start}
        onPause={timer.pause}
        onResume={timer.resume}
        onStop={handleStop}
        onReset={handleReset}
        accentColor={accentColor}
      />
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRight: {
    alignItems: "flex-start",
  },
  changeMode: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  changeModeText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: responsiveSize(18),
    color: "#f00",
  },
});
