import { tabIcons } from "@/assets/images";
import { Colors, responsiveSize } from "@/constants";
import { Tabs } from "expo-router";
import { Image, View } from "react-native";

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
          height: responsiveSize(90),
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
          tabBarIcon: ({ color, focused }) => (
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
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={focused ? tabIcons.workoutSelected : tabIcons.workout}
              style={{ width: responsiveSize(32), height: responsiveSize(32) }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: responsiveSize(64),
                height: responsiveSize(64),
                borderRadius: 36,
                backgroundColor: Colors.primary[500],
                justifyContent: "center",
                alignItems: "center",
                marginTop: responsiveSize(-55),
              }}
            >
              <Image
                source={tabIcons.ai}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="prs"
        options={{
          title: "Personal Records",
          tabBarIcon: ({ color, focused }) => (
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
          tabBarIcon: ({ color, focused }) => (
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
