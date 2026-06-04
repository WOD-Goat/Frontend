import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useTimer } from "@/lib/timer/hooks/useTimer";
import { useTimerTheme } from "@/lib/timer/hooks/useTimerTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TimerControls } from "./TimerControls";
import { TimerDisplay } from "./TimerDisplay";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const PHASE_ACCENT: Record<string, string> = {
  IDLE: "#FF6B2C",
  COUNTDOWN: "#FF6B2C",
  WORK: "#FF6B2C",
  REST: "#EBEBF0",
  COMPLETE: "#34C759",
};

interface Exercise {
  name: string;
  instructions?: string[];
  trackingType?: string;
}

export interface TimerWOD {
  id: string;
  title: string;
  exercises: Exercise[];
  rawText?: string;
  completed: boolean;
}

interface WorkoutTimerOverlayProps {
  visible: boolean;
  wod: TimerWOD | null;
  onMinimize: () => void;
  onStop: () => void;
}

export function WorkoutTimerOverlay({
  visible,
  wod,
  onMinimize,
  onStop,
}: WorkoutTimerOverlayProps) {
  // All hooks must run unconditionally before any early return
  const timer = useTimer();
  const insets = useSafeAreaInsets();
  const { theme, flashAnim, isFlashing } = useTimerTheme(
    timer.phase,
    timer.isFinalCountdown,
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRotate = useRef(new Animated.Value(0)).current;

  // Android hardware back → minimize instead of killing the timer
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onMinimize();
      return true;
    });
    return () => sub.remove();
  }, [visible, onMinimize]);

  const accentColor = PHASE_ACCENT[timer.phase] ?? "#FF6B2C";

  const animatedBg = isFlashing
    ? (flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.background, theme.flashColor],
      }) as unknown as string)
    : theme.background;

  const togglePanel = () => {
    const next = !panelOpen;
    setPanelOpen(next);
    Animated.timing(panelRotate, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const chevronRotation = panelRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Render nothing when hidden — hooks above still run so the timer stays alive
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={onMinimize}>
            <Ionicons
              name="chevron-down"
              size={responsiveSize(20)}
              color={theme.secondaryText}
            />
            <Text style={[styles.headerBtnText, { color: theme.secondaryText }]}>
              Minimize
            </Text>
          </TouchableOpacity>

          {timer.isComplete ? (
            <TouchableOpacity style={styles.headerBtn} onPress={onStop}>
              <Ionicons name="checkmark-done" size={responsiveSize(18)} color="#34C759" />
              <Text style={[styles.headerBtnText, { color: "#34C759" }]}>
                Done
              </Text>
            </TouchableOpacity>
          ) : !timer.isRunning && (
            <TouchableOpacity style={styles.headerBtn} onPress={onStop}>
              <Ionicons name="close" size={responsiveSize(18)} color="#FF3B30" />
              <Text style={[styles.headerBtnText, { color: "#FF3B30" }]}>
                Discard
              </Text>
            </TouchableOpacity>
          )}
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

        {/* Controls */}
        <TimerControls
          isRunning={timer.isRunning}
          hasStarted={timer.hasStarted}
          isComplete={timer.isComplete}
          onStart={timer.start}
          onPause={timer.pause}
          onResume={timer.resume}
          onStop={onStop}
          onReset={timer.reset}
          accentColor={accentColor}
        />

        {/* Exercise panel */}
        {wod && (
          <View style={styles.panelWrapper}>
            <TouchableOpacity
              style={[
                styles.panelToggleRow,
                { borderTopColor: theme.secondaryText + "25" },
              ]}
              onPress={togglePanel}
              activeOpacity={0.7}
            >
              <View style={styles.panelToggleLeft}>
                <Ionicons
                  name="barbell-outline"
                  size={responsiveSize(15)}
                  color={theme.secondaryText}
                />
                <Text
                  style={[styles.panelToggleText, { color: theme.secondaryText }]}
                  numberOfLines={1}
                >
                  {wod.title || "WOD"} —{" "}
                  {wod.rawText
                    ? "Free text"
                    : `${wod.exercises.length} exercise${wod.exercises.length !== 1 ? "s" : ""}`}
                </Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                <Ionicons
                  name="chevron-up"
                  size={responsiveSize(18)}
                  color={theme.secondaryText}
                />
              </Animated.View>
            </TouchableOpacity>

            {panelOpen && (
              <ScrollView
                style={{ maxHeight: SCREEN_HEIGHT * 0.38 }}
                contentContainerStyle={styles.panelContent}
                showsVerticalScrollIndicator={false}
              >
                {wod.rawText ? (
                  <Text style={[styles.rawText, { color: theme.primaryText }]}>
                    {wod.rawText}
                  </Text>
                ) : (
                  wod.exercises.map((ex, i) => (
                    <View
                      key={i}
                      style={[
                        styles.exRow,
                        i < wod.exercises.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.secondaryText + "20",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.exBadge,
                          { backgroundColor: accentColor + "25" },
                        ]}
                      >
                        <Text style={[styles.exNum, { color: accentColor }]}>
                          {String(i + 1).padStart(2, "0")}
                        </Text>
                      </View>
                      <View style={styles.exInfo}>
                        <Text
                          style={[styles.exName, { color: theme.primaryText }]}
                        >
                          {ex.name}
                        </Text>
                        {ex.instructions?.[0] ? (
                          <Text
                            style={[
                              styles.exInstructions,
                              { color: theme.secondaryText },
                            ]}
                          >
                            {ex.instructions[0]}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ))
                )}

              </ScrollView>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 10,
  },
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 8,
  },
  headerBtnText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: responsiveSize(15),
  },
  panelWrapper: {},
  panelToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  panelToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  panelToggleText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    flex: 1,
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  rawText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    lineHeight: 22,
    paddingVertical: 10,
  },
  exRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 11,
    alignItems: "flex-start",
  },
  exBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  exNum: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
  },
  exInfo: {
    flex: 1,
    gap: 3,
  },
  exName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
  },
  exInstructions: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    lineHeight: 16,
  },
});
