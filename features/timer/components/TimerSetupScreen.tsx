// ─────────────────────────────────────────────────────────────────────────────
// TimerSetupScreen — mode selector + config form
//
// Embedded in:  app/timer/index.tsx   (tab-navigable, bottom nav visible)
// On confirm:   pushes to app/timer/active  (full-screen, no bottom nav)
// ─────────────────────────────────────────────────────────────────────────────

import Page from "@/components/ui/Page";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTimer } from "../hooks/useTimer";
import type { WODConfig, WODMode } from "../types";
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
    <Page
      title="WOD TIMER"
      showBackButton={false}
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding={0}
      
    >
      <TimerModeSelector selected={selectedMode} onChange={handleModeChange} />
      <WODConfigForm
        ref={formRef}
        mode={selectedMode}
        onConfirm={handleConfigConfirm}
      />
      <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => formRef.current?.confirm()}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmLabel}>SET TIMER</Text>
        </TouchableOpacity>
    </Page>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    backgroundColor: "#FF6B2C",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmLabel: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 18,
    color: "#000",
    letterSpacing: 3,
  },
});
