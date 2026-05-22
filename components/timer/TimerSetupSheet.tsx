import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { WODConfig, WODMode } from "@/lib/timer/types";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { BottomSheet as RNBottomSheet } from "react-native-btr";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WODConfigForm } from "./WODConfigForm";
import type { WODConfigFormHandle } from "./WODConfigForm";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MODES: {
  id: WODMode;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "FOR_TIME", label: "FOR TIME", description: "Race the clock", icon: "stopwatch-outline" },
  { id: "AMRAP", label: "AMRAP", description: "Max rounds in time", icon: "repeat-outline" },
  { id: "EMOM", label: "EMOM", description: "Every minute on the minute", icon: "alarm-outline" },
  { id: "EXMOM", label: "EXMOM", description: "Custom interval on the minute", icon: "swap-horizontal-outline" },
  { id: "TABATA", label: "TABATA", description: "Work / rest intervals", icon: "flash-outline" },
  { id: "CUSTOM", label: "CUSTOM", description: "Build your own blocks", icon: "construct-outline" },
  { id: "DEATH_BY", label: "DEATH BY", description: "Ascending rep ladder", icon: "skull-outline" },
];

interface TimerSetupSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (config: WODConfig) => void;
}

export function TimerSetupSheet({ visible, onClose, onConfirm }: TimerSetupSheetProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const [selectedMode, setSelectedMode] = useState<WODMode>("FOR_TIME");
  const formRef = useRef<WODConfigFormHandle>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const configureLayout = () =>
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });

  const advanceTo1 = (mode: WODMode) => {
    setSelectedMode(mode);
    slideAnim.setValue(SCREEN_WIDTH);
    configureLayout();
    setStep(1);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const backTo0 = () => {
    slideAnim.setValue(-SCREEN_WIDTH);
    configureLayout();
    setStep(0);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    slideAnim.setValue(0);
    setStep(0);
    onClose();
  };

  return (
    <RNBottomSheet
      visible={visible}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}
    >
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>

        {/* Fixed header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerSideBtn}
            onPress={step === 0 ? handleClose : backTo0}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={step === 0 ? "close" : "chevron-back"}
              size={responsiveSize(22)}
              color={Colors.text.primary}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {step === 0 ? "Workout Mode" : "Timer Settings"}
            </Text>
          </View>

          <View style={styles.dots}>
            <View style={[styles.dot, step === 0 && styles.dotActive]} />
            <View style={[styles.dot, step === 1 && styles.dotActive]} />
          </View>
        </View>

        {/* Content — height auto-fits to active step via LayoutAnimation */}
        <View style={styles.slideWindow}>
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            {step === 0 ? (
              <View style={styles.stepPane}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>WORKOUT MODE</Text>
                </View>
                <View style={styles.sectionGap} />
                <View style={styles.modeGrid}>
                  {MODES.map((m) => {
                    const isActive = m.id === selectedMode;
                    return (
                      <Pressable
                        key={m.id}
                        style={({ pressed }) => [
                          styles.modeCard,
                          isActive && styles.modeCardActive,
                          pressed && styles.modeCardPressed,
                        ]}
                        onPress={() => advanceTo1(m.id)}
                      >
                        <View style={[styles.modeIcon, isActive && styles.modeIconActive]}>
                          <Ionicons
                            name={m.icon}
                            size={responsiveSize(22)}
                            color={isActive ? "#fff" : Colors.neutral[500]}
                          />
                        </View>
                        <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                          {m.label}
                        </Text>
                        <Text style={[styles.modeDesc, isActive && styles.modeDescActive]}>
                          {m.description}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.stepPane}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="settings-outline"
                    size={responsiveSize(13)}
                    color={Colors.neutral[500]}
                  />
                  <Text style={styles.sectionLabel}>SETTINGS</Text>
                </View>
                <View style={styles.sectionGap} />
                <View style={styles.configCard}>
                  <WODConfigForm ref={formRef} mode={selectedMode} onConfirm={onConfirm} />
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Footer — only present on step 1 so it doesn't add height on step 0 */}
        {step === 1 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => formRef.current?.confirm()}
              activeOpacity={0.85}
            >
              <Ionicons name="timer-outline" size={responsiveSize(20)} color="#000" />
              <Text style={styles.startBtnText}>Start Timer</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </RNBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: SCREEN_HEIGHT * 0.92,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700],
    gap: 8,
  },
  headerSideBtn: {
    width: 32,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    lineHeight: 26,
  },

  /* Progress dots */
  dots: {
    width: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neutral[600],
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.primary[500],
  },

  /* Slide container */
  slideWindow: {
    overflow: "hidden",
  },
  stepPane: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },

  /* Section label */
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
  sectionGap: {
    height: 10,
  },

  /* Mode cards */
  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modeCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.secondary[600],
    alignItems: "center",
  },
  modeCardActive: {
    borderColor: Colors.primary[500],
    backgroundColor: "rgba(255,107,44,0.10)",
  },
  modeCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modeIconActive: {
    backgroundColor: Colors.primary[500],
  },
  modeLabel: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: responsiveSize(15),
    color: Colors.text.primary,
    letterSpacing: 0.3,
    marginBottom: 2,
    textAlign: "center",
  },
  modeLabelActive: {
    color: Colors.primary[500],
  },
  modeDesc: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(11),
    color: Colors.neutral[500],
    lineHeight: responsiveSize(16),
    textAlign: "center",
  },
  modeDescActive: {
    color: Colors.primary[300],
  },

  /* Config form */
  configCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    overflow: "hidden",
  },

  /* Footer */
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary[500],
    borderRadius: 14,
    paddingVertical: 14,
  },
  startBtnText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.bodyLG,
    color: "#000",
    letterSpacing: 0.5,
  },
});
