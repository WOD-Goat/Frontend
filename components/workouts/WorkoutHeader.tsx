import { icons } from "@/assets/images";
import { Colors, FontFamilies, FontSizes } from "@/constants";
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
        <View style={{ flexDirection: "row", gap: 16 }}>
          {/* <Pressable onPress={handleGroupWorkoutPress}>
            <Image source={icons.groups} style={{ width: 28, height: 28 }} />
          </Pressable> */}
          <Pressable onPress={handleAddWorkout}>
            <Image source={icons.add} style={{ width: 28, height: 28 }} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.subtitle}>
        It's your turn, show me what you can do
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    marginRight: 16,
    flexDirection: "row",
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
  },
  subtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
});
