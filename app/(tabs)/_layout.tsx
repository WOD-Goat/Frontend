import { tabIcons } from "@/assets/images";
import { Colors, responsiveSize } from "@/constants";
import { Tabs } from "expo-router";
import { Image, Platform, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.secondary[600],
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: 10,
          paddingTop: 10,
          height: Platform.OS === "ios" ? responsiveSize(90) : responsiveSize(110),
          position: "absolute",
          borderColor: Colors.neutral[700],
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          display: "none", // Hide labels to match design
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? tabIcons.homeSelected : tabIcons.home}
              style={{ width: responsiveSize(32), height: responsiveSize(32) }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? tabIcons.workoutSelected : tabIcons.workout}
              style={{ width: responsiveSize(32), height: responsiveSize(32) }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? tabIcons.timerSelected : tabIcons.timer}
              style={{ width: responsiveSize(34), height: responsiveSize(34) }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="prs"
        options={{
          title: "Personal Records",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? tabIcons.prSelected : tabIcons.pr}
              style={{ width: responsiveSize(32), height: responsiveSize(32) }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? tabIcons.profileSelected : tabIcons.profile}
              style={{ width: responsiveSize(32), height: responsiveSize(32) }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
