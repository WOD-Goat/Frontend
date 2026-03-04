// ─────────────────────────────────────────────────────────────────────────────
// TimerControls — icon-based action buttons
//
// Running  → single centre button: ⏸ pause
// Paused   → ↺ reset (left)  |  ▶ continue (centre)  |  ✓ done (right)
// Complete → single centre button: ✓ done
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface TimerControlsProps {
  isRunning: boolean;
  hasStarted: boolean;
  isComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  accentColor: string;
}

export const TimerControls = memo(function TimerControls({
  isRunning,
  hasStarted,
  isComplete,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  accentColor,
}: TimerControlsProps) {
  function handlePause() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPause();
  }

  function handleResume() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!hasStarted) onStart();
    else onResume();
  }

  function handleReset() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReset();
  }

  function handleDone() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStop();
  }

  // ── RUNNING: single pause button ──────────────────────────────────────────
  if (isRunning) {
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: accentColor }]}
          onPress={handlePause}
          activeOpacity={0.8}
        >
          <Ionicons name="pause" size={36} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  }

  // ── COMPLETE: single done/checkmark button ────────────────────────────────
  if (isComplete) {
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: "#34C759" }]}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={40} color="#000" />
        </TouchableOpacity>
      </View>
    );
  }

  // ── PAUSED: reset | continue | done ───────────────────────────────────────
  return (
    <View style={styles.row}>
      {/* Reset */}
      <TouchableOpacity
        style={styles.sideBtn}
        onPress={handleReset}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={26} color="#8E8E93" />
      </TouchableOpacity>

      {/* Continue / play */}
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: accentColor }]}
        onPress={handleResume}
        activeOpacity={0.8}
      >
        <Ionicons name="play" size={36} color="#ffffff" />
      </TouchableOpacity>

      {/* Done / complete */}
      <TouchableOpacity
        style={styles.sideBtn}
        onPress={handleDone}
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark" size={30} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },

  // Large filled circle — primary action
  primaryBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // Smaller outlined circle — secondary actions
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#8E8E93",
    alignItems: "center",
    justifyContent: "center",
  },
});
