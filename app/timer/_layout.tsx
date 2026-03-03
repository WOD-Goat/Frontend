// app/timer/_layout.tsx
// Stack navigator for the timer feature.
// - index  (setup)  → tab bar is visible (controlled by (tabs) layout)
// - active (clock)  → tab bar hidden, full-screen, no gesture swipe-back
import { Stack } from "expo-router";

export default function TimerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="active"
        options={{
          // Prevent accidental swipe-back while a workout is running
          gestureEnabled: false,
          // Slide up like a modal for a clean full-screen feel
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
