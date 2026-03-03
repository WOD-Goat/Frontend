// ─────────────────────────────────────────────────────────────────────────────
// TimerModeSelector — 2-column card grid for WOD modes
// ─────────────────────────────────────────────────────────────────────────────

import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WODMode } from "../types";

const MODES: {
  id: WODMode;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "FOR_TIME",
    label: "For Time",
    description: "Race the clock",
    icon: "stopwatch-outline",
  },
  {
    id: "AMRAP",
    label: "AMRAP",
    description: "Max rounds in time",
    icon: "repeat-outline",
  },
  {
    id: "EMOM",
    label: "EMOM",
    description: "Every minute on the minute",
    icon: "alarm-outline",
  },
  {
    id: "EXMOM",
    label: "EXMOM",
    description: "Custom interval on the minute",
    icon: "swap-horizontal-outline",
  },
  {
    id: "TABATA",
    label: "Tabata",
    description: "Work / rest intervals",
    icon: "flash-outline",
  },
  {
    id: "CUSTOM",
    label: "Custom",
    description: "Build your own blocks",
    icon: "construct-outline",
  },
  {
    id: "DEATH_BY",
    label: "Death By",
    description: "Ascending rep ladder",
    icon: "skull-outline",
  },
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
    <View style={styles.grid}>
      {MODES.map((m) => {
        const isActive = m.id === selected;
        return (
          <Pressable
            key={m.id}
            style={({ pressed }) => [
              styles.card,
              isActive && styles.cardActive,
              pressed && styles.cardPressed,
            ]}
            onPress={() => onChange(m.id)}
          >
            <View
              style={[styles.iconCircle, isActive && styles.iconCircleActive]}
            >
              <Ionicons
                name={m.icon}
                size={20}
                color={isActive ? "#FFF" : Colors.neutral[500]}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {m.label}
            </Text>
            <Text style={[styles.desc, isActive && styles.descActive]}>
              {m.description}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  /* Card */
  card: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  cardActive: {
    borderColor: Colors.primary[500],
    backgroundColor: "rgba(255,107,44,0.08)",
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  /* Icon */
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  iconCircleActive: {
    backgroundColor: Colors.primary[500],
  },

  /* Text */
  label: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 15,
    color: Colors.text.primary,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  labelActive: {
    color: Colors.primary[500],
  },
  desc: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: Colors.neutral[500],
    lineHeight: 15,
  },
  descActive: {
    color: Colors.primary[300],
  },
});
