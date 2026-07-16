import { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { TOUR_STEPS } from "@/constants/tourSteps";
import { useTourStore } from "@/lib/tour/tourStore";

const { height: SCREEN_H } = Dimensions.get("window");
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_HEIGHT_ESTIMATE = 190;

export default function TourOverlay() {
  const isActive = useTourStore((s) => s.isActive);
  const currentStepIndex = useTourStore((s) => s.currentStepIndex);
  const targets = useTourStore((s) => s.targets);
  const next = useTourStore((s) => s.next);
  const skip = useTourStore((s) => s.skip);

  const step = TOUR_STEPS[currentStepIndex];
  const rect = step?.targetId ? targets[step.targetId] : undefined;

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!rect) {
      opacity.value = withTiming(0, { duration: 150 });
      return;
    }
    x.value = withTiming(rect.x, { duration: 300 });
    y.value = withTiming(rect.y, { duration: 300 });
    w.value = withTiming(rect.width, { duration: 300 });
    h.value = withTiming(rect.height, { duration: 300 });
    opacity.value = withTiming(1, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rect?.x, rect?.y, rect?.width, rect?.height]);

  const spotlightStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: x.value - SPOTLIGHT_PADDING,
    top: y.value - SPOTLIGHT_PADDING,
    width: w.value + SPOTLIGHT_PADDING * 2,
    height: h.value + SPOTLIGHT_PADDING * 2,
    borderRadius: 18,
    opacity: opacity.value,
    // Huge-spread box-shadow punches a rounded "hole" in a full-screen dark
    // backdrop with no mask/SVG library needed.
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
  }));

  const tooltipStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!isActive || !step) return null;

  const isLast = currentStepIndex === TOUR_STEPS.length - 1;
  const showsNextButton = step.advanceOn !== "targetPress";

  // Place the tooltip on whichever half of the screen the target isn't in,
  // so it never covers what it's explaining. Falls back to center while
  // waiting for the next target to register (e.g. right after a tab switch).
  const targetMidY = rect ? rect.y + rect.height / 2 : SCREEN_H / 2;
  const tooltipTop =
    targetMidY > SCREEN_H / 2
      ? Math.max(rect ? rect.y - TOOLTIP_HEIGHT_ESTIMATE - 16 : 0, 60)
      : (rect ? rect.y + rect.height : SCREEN_H / 2) + 16;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={spotlightStyle} pointerEvents="none" />

      <Animated.View style={[styles.tooltip, { top: tooltipTop }, tooltipStyle]}>
        <Text style={styles.stepCounter}>
          {currentStepIndex + 1} / {TOUR_STEPS.length}
        </Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
        <View style={styles.actionsRow}>
          <Pressable onPress={skip} hitSlop={8}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          {showsNextButton ? (
            <Pressable style={styles.nextBtn} onPress={next}>
              <Text style={styles.nextText}>{isLast ? "Done" : "Next"}</Text>
            </Pressable>
          ) : (
            <Text style={styles.hintText}>Tap the highlighted button</Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: Colors.secondary[600],
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "40",
    padding: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
  stepCounter: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.labelXS,
    color: Colors.primary[500],
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
  },
  description: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  skipText: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.tertiary,
  },
  hintText: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  nextBtn: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nextText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.bodySM,
    color: "#0D0D14",
  },
});
