import { icons } from "@/assets/images";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function WorkoutHeader() {
  const handleAddWorkout = () => {
    router.push("/workout/create");
  };
  //   const handleGroupWorkoutPress = () => {
  //   router.push("/groups");
  // };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>
          It's your turn, show me what you can do
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 16 }}>
        {/* <Pressable onPress={handleGroupWorkoutPress}>
            <Image source={icons.groups} style={{ width: 28, height: 28 }} />
          </Pressable> */}
        <Pressable onPress={handleAddWorkout}>
          <Image source={icons.add} style={{ width: 28, height: 28 }} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  addButton: {
    width: responsiveSize(44),
    height: responsiveSize(44),
    borderRadius: 14,
    backgroundColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
});
