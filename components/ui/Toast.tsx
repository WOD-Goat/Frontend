import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors, FontFamilies, FontSizes } from "../../constants";

export type ToastType = "success" | "error";

export interface ToastProps {
  visible: boolean;
  type: ToastType;
  label: string;
  duration?: number;
  onHide?: () => void;
}

const CONFIG: Record<
  ToastType,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  success: { icon: "checkmark-circle", color: Colors.success[500] },
  error: { icon: "close-circle", color: Colors.error[500] },
};

export default function Toast({
  visible,
  type,
  label,
  duration = 3000,
  onHide,
}: ToastProps) {
  const [rendered, setRendered] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 24,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRendered(false);
      onHide?.();
    });
  };

  useEffect(() => {
    if (!visible) return;

    setRendered(true);
    opacity.setValue(0);
    translateY.setValue(24);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(animateOut, duration);

    return () => {
      clearTimeout(timer);
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [visible]);

  if (!rendered) return null;

  const { icon, color } = CONFIG[type];

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          { borderColor: color, opacity, transform: [{ translateY }] },
        ]}
      >
        <Ionicons name={icon} size={22} color={color} />
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 96,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    width: "88%",
    backgroundColor: Colors.neutral[700],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    flex: 1,
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.headingSM,
    color: Colors.text.primary,
  },
});
