// ─────────────────────────────────────────────────────────────────────────────
// TimerModeSelector — horizontal pill selector for WOD modes
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";
import type { WODMode } from "../types";

const MODES: { id: WODMode; label: string; description: string }[] = [
  { id: "FOR_TIME", label: "For Time", description: "Beat the clock" },
  { id: "AMRAP", label: "AMRAP", description: "As many rounds" },
  { id: "EMOM", label: "EMOM", description: "Every minute" },
  { id: "EXMOM", label: "EXMOM", description: "Custom interval" },
  { id: "TABATA", label: "Tabata", description: "20/10 intervals" },
  { id: "CUSTOM", label: "Custom", description: "Build your own" },
  { id: "DEATH_BY", label: "Death By", description: "Rep ladder" },
];

interface TimerModeSelectorProps {
  selected: WODMode;
  onChange: (mode: WODMode) => void;
}

export const TimerModeSelector = memo(function TimerModeSelector({
  selected,
  onChange,
}: TimerModeSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {MODES.map((m) => {
        const isActive = m.id === selected;
        return (
          <TouchableOpacity
            key={m.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onChange(m.id)}
            activeOpacity={0.75}
          >
            <Text
              style={[styles.pillLabel, isActive && styles.pillLabelActive]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#2E2E2E",
    borderWidth: 1,
    borderColor: "transparent",
  },
  pillActive: {
    backgroundColor: "#1C0B00",
    borderColor: "#FF6B2C",
  },
  pillLabel: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: 15,
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
  pillLabelActive: {
    color: "#FF6B2C",
  },
});
