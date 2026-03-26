import FloatingTabBar from "@/components/navigation/FloatingTabBar";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Workouts" }}
      />
      <Tabs.Screen
        name="groups"
        options={{ title: "Groups" }}
      />
      <Tabs.Screen
        name="timer"
        options={{ title: "Timer" }}
      />
      <Tabs.Screen
        name="prs"
        options={{ title: "PRs" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
    </Tabs>
  );
}
