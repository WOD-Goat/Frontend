import {
  BorderRadius,
  Colors,
  FontFamilies,
  FontSizes,
  Spacing,
} from "@/constants";
import {
  useVoiceWorkout,
  type VoiceWorkoutResult,
} from "@/lib/ai/useVoiceWorkout";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ---------- Waveform ----------
const BARS = [
  { maxH: 12, dur: 700 },
  { maxH: 24, dur: 520 },
  { maxH: 34, dur: 610 },
  { maxH: 42, dur: 430 },
  { maxH: 48, dur: 560 },
  { maxH: 42, dur: 470 },
  { maxH: 34, dur: 640 },
  { maxH: 24, dur: 500 },
  { maxH: 12, dur: 720 },
];

function WaveBar({
  maxH,
  dur,
  isActive,
}: {
  maxH: number;
  dur: number;
  isActive: boolean;
}) {
  const h = useSharedValue(4);

  useEffect(() => {
    if (isActive) {
      const minH = 4 + Math.random() * 7;
      h.value = withRepeat(
        withSequence(
          withTiming(maxH, {
            duration: dur,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(minH, {
            duration: dur,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );
    } else {
      h.value = withTiming(4, { duration: 350 });
    }
  }, [isActive]);

  const style = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[styles.bar, style]} />;
}

// ---------- Speaking Guide ----------
const GUIDE_ITEMS = [
  {
    icon: "layers-outline" as const,
    label: "Exercises per WOD",
    examples: ["Wod 1 - 3 sets of 10 squats and 20 push-ups"],
  },
  {
    icon: "scale-outline" as const,
    label: "Optional details",
    examples: ["Weight: @80kg", "Time: @3min", "Distance: @500m"],
  },
  {
    icon: "calendar-outline" as const,
    label: "When to schedule",
    examples: ["For tomorrow", "Next Monday", "Today"],
  },
];

function SpeakingGuide() {
  return (
    <View style={styles.guideContainer}>
      <View style={styles.guideTitleRow}>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={Colors.text.secondary}
        />
        <Text style={styles.guideTitle}>
          What to include in your description
        </Text>
      </View>
      {GUIDE_ITEMS.map((item) => (
        <View key={item.label} style={styles.guideItem}>
          <View style={styles.guideIconWrap}>
            <Ionicons name={item.icon} size={15} color={Colors.primary[500]} />
          </View>
          <View style={styles.guideText}>
            <Text style={styles.guideLabel}>{item.label}</Text>
            <Text style={styles.guideExamples}>
              {item.examples.map((e, i) =>
                i < item.examples.length - 1 ? `"${e}"  ·  ` : `"${e}"`,
              )}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------- Props ----------
interface VoiceRecorderModalProps {
  visible: boolean;
  onClose: () => void;
  onResult: (result: VoiceWorkoutResult) => void;
}

export function VoiceRecorderModal({
  visible,
  onClose,
  onResult,
}: VoiceRecorderModalProps) {
  const insets = useSafeAreaInsets();
  const {
    recordingState,
    elapsedSeconds,
    result,
    errorMessage,
    startRecording,
    stopAndProcess,
    reset,
  } = useVoiceWorkout();

  // Pulse ring
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  // Drive pulse animation based on recording state
  useEffect(() => {
    if (recordingState === "recording") {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.7, { duration: 950, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 950, easing: Easing.in(Easing.ease) }),
        ),
        -1,
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.28, { duration: 950 }),
          withTiming(0, { duration: 950 }),
        ),
        -1,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      pulseOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [recordingState]);

  // When Gemini returns a result, pass it up and close
  useEffect(() => {
    if (recordingState === "review" && result) {
      onResult(result);
      handleClose();
    }
  }, [recordingState, result]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handleClose = () => {
    reset();
    onClose();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing";
  const isIdle = recordingState === "idle";
  const isError = recordingState === "error";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        {/* Backdrop — tapping it while not recording closes the modal */}
        <Pressable
          style={styles.backdrop}
          onPress={isRecording ? undefined : handleClose}
        />

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          {/* Fixed header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {isProcessing
                ? "Analyzing..."
                : isError
                  ? "Voice Input"
                  : "Voice Input"}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.sheetContent,
              { paddingBottom: insets.bottom + 28 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Mic + pulse area */}
            <View style={styles.micArea}>
              <Animated.View style={[styles.pulseRing, pulseStyle]} />
              <TouchableOpacity
                style={[styles.micCircle, isProcessing && styles.micCircleDim]}
                onPress={isIdle ? startRecording : undefined}
                activeOpacity={isIdle ? 0.75 : 1}
                disabled={!isIdle}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Ionicons
                    name={isError ? "mic-off" : "mic"}
                    size={42}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>

              {isRecording && (
                <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
              )}

              <Text style={styles.statusText}>
                {isIdle && "Tap the mic to start"}
                {isRecording && "Listening to you..."}
                {isProcessing && "Reading your workout"}
                {isError && (errorMessage ?? "Something went wrong.")}
              </Text>

              {isProcessing && (
                <Text style={styles.poweredBy}>Powered by Gemini AI</Text>
              )}
            </View>

            {/* Waveform (always mounted so animations don't remount; isActive controls height) */}
            <View style={styles.waveform}>
              {BARS.map((b, i) => (
                <WaveBar
                  key={i}
                  maxH={b.maxH}
                  dur={b.dur}
                  isActive={isRecording}
                />
              ))}
            </View>

            {/* Stop button + guide */}
            {isRecording && (
              <>
                <TouchableOpacity
                  style={styles.stopBtn}
                  onPress={stopAndProcess}
                  activeOpacity={0.75}
                >
                  <View style={styles.stopIcon} />
                  <Text style={styles.stopText}>Tap to stop</Text>
                </TouchableOpacity>

                <SpeakingGuide />
              </>
            )}
            {/* Guide shown at idle before recording starts */}
            {isIdle && <SpeakingGuide />}
            {isError && (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={reset}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
  },
  scrollArea: {
    flexGrow: 1,
  },
  sheetContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  micArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  pulseRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[500],
  },
  micCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    // Glow effect
    shadowColor: Colors.primary[500],
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  micCircleDim: {
    opacity: 0.7,
  },
  timer: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    letterSpacing: 1,
  },
  statusText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  poweredBy: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelXS,
    color: Colors.text.secondary,
    opacity: 0.6,
    marginTop: Spacing.xs,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 56,
    marginBottom: Spacing.xl,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary[500],
  },
  stopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md + 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  stopIcon: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: Colors.error[500],
  },
  stopText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  hint: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelXS,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
    lineHeight: FontSizes.labelXS * 1.6,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md + 2,
    alignSelf: "center",
  },
  retryText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: "#fff",
  },
  guideContainer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  guideTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  guideTitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelXS,
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  guideItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  guideIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary[500] + "18",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  guideText: {
    flex: 1,
    gap: 2,
  },
  guideLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.labelSM,
    color: Colors.text.primary,
  },
  guideExamples: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelXS,
    color: Colors.text.secondary,
    lineHeight: FontSizes.labelXS * 1.6,
  },
  guideExampleBlock: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary[500],
  },
  guideExampleLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.labelXS,
    color: Colors.primary[500],
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  guideExampleText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelSM,
    color: Colors.text.secondary,
    fontStyle: "italic",
    lineHeight: FontSizes.labelSM * 1.6,
  },
});
