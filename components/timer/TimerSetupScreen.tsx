// ─────────────────────────────────────────────────────────────────────────────
// TimerSetupScreen — modern mode selector + config form
//
// Embedded in:  app/timer/index.tsx   (tab-navigable, bottom nav visible)
// On confirm:   pushes to app/timer/active  (full-screen, no bottom nav)
// ─────────────────────────────────────────────────────────────────────────────

import { Gap } from "@/components";
import Page from "@/components/ui/Page";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { useTimer } from "@/lib/timer/hooks/useTimer";
import type { WODConfig, WODMode } from "@/lib/timer/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TimerModeSelector } from "./TimerModeSelector";
import type { WODConfigFormHandle } from "./WODConfigForm";
import { WODConfigForm } from "./WODConfigForm";

export default function TimerSetupScreen() {
  const timer = useTimer();
  const [selectedMode, setSelectedMode] = useState<WODMode>("FOR_TIME");
  const formRef = useRef<WODConfigFormHandle>(null);

  const handleModeChange = useCallback((mode: WODMode) => {
    setSelectedMode(mode);
  }, []);

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
      {/* ── Header (same as PRHeader) ── */}
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
          size={16}
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

      <Gap size={24} />

      {/* ── Confirm Button ── */}
      <Pressable
        onPress={() => formRef.current?.confirm()}
        style={({ pressed }) => [
          styles.confirmButton,
          pressed && styles.confirmButtonPressed,
        ]}
      >
        <Ionicons
          name="play"
          size={22}
          color="#FFF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.confirmLabel}>START TIMER</Text>
      </Pressable>
    </Page>
  );
}

const styles = StyleSheet.create({
  /* Header — matches PRHeader */
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
  },
  headerSubtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 12,
    color: Colors.neutral[500],
    letterSpacing: 2.5,
  },

  /* Settings card */
  settingsCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    overflow: "hidden",
  },

  /* CTA Button */
  confirmButton: {
    height: 58,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  confirmLabel: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 3,
  },
});
