import { tabIcons } from "@/assets/images";
import { Colors, responsiveSize } from "@/constants";
import { useTimerStore } from "@/lib/timer/viewmodels/timerStore";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// ─── Constants ────────────────────────────────────────────────────────────────
const PILL_HEIGHT = 64;
const PILL_BORDER_RADIUS = 32;
const ICON_SIZE = 28;
const PLUS_SIZE = 56;
const PLUS_GAP = 10;
const HORIZONTAL_MARGIN = 16;

// ─── Tab icon map ─────────────────────────────────────────────────────────────
const TAB_ICONS: Record<string, { default: any; selected: any }> = {
  index: { default: tabIcons.workout, selected: tabIcons.workoutSelected },
  groups: { default: tabIcons.groups, selected: tabIcons.groupsSelected },
  prs: { default: tabIcons.pr, selected: tabIcons.prSelected },
  timer: { default: tabIcons.timer, selected: tabIcons.timerSelected },
  profile: { default: tabIcons.profile, selected: tabIcons.profileSelected },
};

const FAB_TABS = new Set(["index", "groups", "timer"]);

export default function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const requestConfirm = useTimerStore((s) => s.requestConfirm);
  const bottomPadding =
    Platform.OS === "ios" ? Math.max(insets.bottom, 8) : 12;

  const activeRoute = state.routes[state.index].name;
  const activeOptions = descriptors[state.routes[state.index].key].options as any;
  const showPlus = FAB_TABS.has(activeRoute) && (activeOptions.tabBarShowFAB !== false);

  // Keep the last "plus-visible" route so the icon doesn't flicker during hide animation
  const visibleRouteRef = useRef(activeRoute);
  if (showPlus) visibleRouteRef.current = activeRoute;
  const iconRoute = visibleRouteRef.current;

  // ─── Animate + button in/out ───────────────────────────────────────────────
  const plusAnim = useRef(new Animated.Value(showPlus ? 1 : 0)).current;

  // ─── Pulse ring animation ──────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.spring(plusAnim, {
      toValue: showPlus ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();

    if (showPlus) {
      pulseAnim.setValue(0);
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
    }

    return () => pulseLoop.current?.stop();
  }, [showPlus]);

  const plusEntryStyle = {
    opacity: plusAnim,
    transform: [
      {
        scale: plusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        }),
      },
    ],
    pointerEvents: showPlus ? ("auto" as const) : ("none" as const),
  };

  const pulseRingStyle = {
    opacity: pulseAnim.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.5, 0.25, 0],
    }),
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.7],
        }),
      },
    ],
  };

  // ─── + button action ───────────────────────────────────────────────────────
  const handlePlusPress = () => {
    if (iconRoute === "index") {
      router.push("/workout/create");
    } else if (iconRoute === "groups") {
      router.push("/group/create");
    } else if (iconRoute === "timer") {
      requestConfirm();
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      {/* Floating + button */}
      <Animated.View style={[styles.plusContainer, plusEntryStyle]}>
        {/* Pulse ring */}
        <Animated.View
          style={[styles.pulseRing, pulseRingStyle]}
          pointerEvents="none"
        />

        {/* Outer glow wrapper */}
        <View style={styles.plusGlowOuter}>
          {/* Button */}
          <Pressable
            onPress={handlePlusPress}
            style={({ pressed }) => [
              styles.plusButton,
              pressed && styles.plusButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              iconRoute === "index" ? "Create Workout"
              : iconRoute === "timer" ? "Start Timer"
              : "Create Group"
            }
          >
            <Ionicons
              name={iconRoute === "timer" ? "play" : "add"}
              size={iconRoute === "timer" ? 26 : 30}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </Animated.View>

      {/* Gap */}
      <View style={styles.plusGap} />

      {/* Frosted glass pill */}
      <BlurView
        intensity={55}
        tint="dark"
        style={styles.pill}
        experimentalBlurMethod="dimezisBlurView"
      >
        <View style={styles.pillInner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: "tabLongPress", target: route.key });
            };

            const iconConfig = TAB_ICONS[route.name];
            const iconSource = iconConfig
              ? isFocused
                ? iconConfig.selected
                : iconConfig.default
              : null;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    isFocused && styles.iconWrapperActive,
                  ]}
                >
                  {iconSource && (
                    <Image
                      source={iconSource}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    alignItems: "center",
  },

  // ─── + button ─────────────────────────────────────────────────────────────
  plusContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: PLUS_SIZE + 32, // room for pulse ring
    height: PLUS_SIZE + 32,
  },
  pulseRing: {
    position: "absolute",
    width: PLUS_SIZE,
    height: PLUS_SIZE,
    borderRadius: PLUS_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[500] + "20",
  },
  plusGlowOuter: {
    borderRadius: PLUS_SIZE / 2,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary[400],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.65,
        shadowRadius: 14,
      },
      android: {
        elevation: 16,
        shadowColor: Colors.primary[500],
      },
    }),
  },
  plusButton: {
    width: PLUS_SIZE,
    height: PLUS_SIZE,
    borderRadius: PLUS_SIZE / 2,
    backgroundColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
  plusButtonPressed: {
    transform: [{ scale: 0.91 }],
    backgroundColor: Colors.primary[600],
  },
  plusGap: {
    height: PLUS_GAP,
  },

  // ─── Frosted glass pill ──────────────────────────────────────────────────
  pill: {
    width: "100%",
    borderRadius: PILL_BORDER_RADIUS,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  pillInner: {
    flexDirection: "row",
    height: PILL_HEIGHT,
    alignItems: "center",
    backgroundColor: "rgba(20, 20, 26, 0.45)",
  },

  // ─── Tab items ───────────────────────────────────────────────────────────
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: PILL_HEIGHT,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    backgroundColor: Colors.primary[500] + "22",
  },
  icon: {
    width: responsiveSize(ICON_SIZE),
    height: responsiveSize(ICON_SIZE),
  },
});
