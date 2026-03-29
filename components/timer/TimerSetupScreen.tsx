// ─────────────────────────────────────────────────────────────────────────────
// TimerSetupScreen — modern mode selector + config form
//
// Embedded in:  app/timer/index.tsx   (tab-navigable, bottom nav visible)
// On confirm:   pushes to app/timer/active  (full-screen, no bottom nav)
// ─────────────────────────────────────────────────────────────────────────────

import { Gap } from "@/components";
import Page from "@/components/ui/Page";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
import { useTimer } from "@/lib/timer/hooks/useTimer";
import type { WODConfig, WODMode } from "@/lib/timer/types";
import { useTimerStore } from "@/lib/timer/viewmodels/timerStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TimerModeSelector } from "./TimerModeSelector";
import type { WODConfigFormHandle } from "./WODConfigForm";
import { WODConfigForm } from "./WODConfigForm";

export default function TimerSetupScreen() {
  const timer = useTimer();
  const [selectedMode, setSelectedMode] = useState<WODMode>("FOR_TIME");
  const formRef = useRef<WODConfigFormHandle>(null);
  const { guard } = useFeatureGuard();

  const pendingConfirm = useTimerStore((s) => s.pendingConfirm);
  const clearConfirm = useTimerStore((s) => s.clearConfirm);

  // When the FAB in the tab bar fires, trigger the form confirm
  useEffect(() => {
    if (pendingConfirm) {
      clearConfirm();
      formRef.current?.confirm();
    }
  }, [pendingConfirm]);

  const handleModeChange = useCallback(
    (mode: WODMode) => {
      if (mode === "CUSTOM") {
        guard("customTimerIntervals", () => setSelectedMode(mode));
        return;
      }
      setSelectedMode(mode);
    },
    [guard],
  );

  const handleConfigConfirm = useCallback(
    (config: WODConfig) => {
      timer.configure(config);
      timer.start();
      router.push("/timer/active");
    },
    [timer],
  );

  return (
    <Page showBackButton={false}>
      {/* ── Header ── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>WOD Timer</Text>
          <Text style={styles.headerSubtitle}>Choose your workout style</Text>
        </View>
      </View>

      {/* ── Section: Mode ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>WORKOUT MODE</Text>
      </View>
      <Gap size={10} />
      <TimerModeSelector selected={selectedMode} onChange={handleModeChange} />

      <Gap size={24} />

      {/* ── Section: Settings ── */}
      <View style={styles.sectionHeader}>
        <Ionicons
          name="settings-outline"
          size={responsiveSize(16)}
          color={Colors.neutral[500]}
        />
        <Text style={styles.sectionLabel}>SETTINGS</Text>
      </View>
      <Gap size={10} />
      <View style={styles.settingsCard}>
        <WODConfigForm
          ref={formRef}
          mode={selectedMode}
          onConfirm={handleConfigConfirm}
        />
      </View>

      <Gap size={100} />
    </Page>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 28,
  },
  headerSubtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(12),
    color: Colors.neutral[500],
    letterSpacing: 2.5,
  },
  settingsCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    overflow: "hidden",
  },
});
