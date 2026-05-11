// ─────────────────────────────────────────────────────────────────────────────
// TimerDisplay — the primary clock face
//
// Design rules for distance visibility:
//  - Primary time: 128px font minimum, LeagueSpartan-Bold, letter-spacing -2
//  - Phase label:  32px, ALL CAPS, wide letter-spacing
//  - Round badge:  24px, top-right corner
//  - Interval time (secondary clock): 64px, below primary
//
// All text colors and backgrounds drive from useTimerTheme.
// The flashing background replaces the entire screen BG — not just text.
// ─────────────────────────────────────────────────────────────────────────────

import { responsiveSize } from "@/constants";
import type { TimerTheme } from "@/lib/timer/types";
import { memo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimerDisplayProps {
  primaryTime: string; // "MM:SS"
  intervalTime: string | null; // "MM:SS" or null
  label: string;
  currentRound: number;
  totalRounds: number | undefined;
  isComplete: boolean;
  // Theme is owned by the screen so the bg covers the full viewport
  theme: TimerTheme;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TimerDisplay = memo(function TimerDisplay({
  primaryTime,
  intervalTime,
  label,
  currentRound,
  totalRounds,
  isComplete,
  theme,
}: TimerDisplayProps) {
  const roundLabel =
    totalRounds !== undefined ? `${currentRound} / ${totalRounds}` : null;

  return (
    <View style={styles.container}>
      {/* Phase label — top centre */}
      <Text
        style={[styles.phaseLabel, { color: theme.secondaryText }]}
        numberOfLines={1}
      >
        {label.toUpperCase()}
      </Text>

      {/* Primary clock — largest element on screen */}
      <Text
        style={[styles.primaryTime, { color: theme.primaryText }]}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        numberOfLines={1}
      >
        {primaryTime}
      </Text>

      {/* Total remaining sub-clock (EMOM / Tabata / Custom) */}
      {intervalTime !== null && (
        <View style={styles.intervalRow}>
          <Text style={[styles.intervalLabel, { color: theme.secondaryText }]}>
            TOTAL
          </Text>
          <Text style={[styles.intervalTime, { color: theme.secondaryText }]}>
            {intervalTime}
          </Text>
        </View>
      )}

      {/* Round badge — bottom */}
      {roundLabel !== null && (
        <View style={[styles.roundBadge, { borderColor: theme.secondaryText }]}>
          <Text style={[styles.roundText, { color: theme.primaryText }]}>
            ROUND {roundLabel}
          </Text>
        </View>
      )}

      {/* Complete state overlay text */}
      {isComplete && (
        <Text style={[styles.completeText, { color: theme.primaryText }]}>
          DONE!
        </Text>
      )}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  phaseLabel: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: responsiveSize(28),
    letterSpacing: 6,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  // Target: readable from 5+ meters. 128pt at full size on a 390pt-wide screen.
  primaryTime: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: responsiveSize(128),
    letterSpacing: -4,
    lineHeight: responsiveSize(130),
    textAlign: "center",
    width: SCREEN_WIDTH - 32,
  },

  intervalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 12,
  },

  intervalLabel: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: responsiveSize(16),
    letterSpacing: 3,
  },

  intervalTime: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: responsiveSize(64),
    letterSpacing: -2,
    lineHeight: responsiveSize(68),
  },

  roundBadge: {
    marginTop: 24,
    borderWidth: 1.5,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },

  roundText: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: responsiveSize(20),
    letterSpacing: 3,
  },

  completeText: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: responsiveSize(48),
    letterSpacing: 8,
    marginTop: 24,
  },
});
