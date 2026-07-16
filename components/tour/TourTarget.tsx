import { useCallback, useEffect, useRef } from "react";
import { View, ViewStyle } from "react-native";
import { useTourStore } from "@/lib/tour/tourStore";

interface TourTargetProps {
  /** Id this element is registered under — must match a step's targetId. */
  id: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Wraps a real UI element so the tour overlay can spotlight it. Doesn't
 * intercept touches — it only measures its own bounds (in window
 * coordinates) and registers them with the tour store whenever the tour is
 * active and this element re-lays-out.
 */
export default function TourTarget({ id, children, style }: TourTargetProps) {
  const viewRef = useRef<View>(null);
  const isActive = useTourStore((s) => s.isActive);
  const registerTarget = useTourStore((s) => s.registerTarget);

  const measure = useCallback(() => {
    // Defer to the next frame so layout has settled (e.g. right after a tab switch).
    requestAnimationFrame(() => {
      viewRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          registerTarget(id, { x, y, width, height });
        }
      });
    });
  }, [id, registerTarget]);

  useEffect(() => {
    if (isActive) measure();
  }, [isActive, measure]);

  return (
    <View ref={viewRef} style={style} onLayout={measure} collapsable={false}>
      {children}
    </View>
  );
}
