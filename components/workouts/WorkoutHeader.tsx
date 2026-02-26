import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function WorkoutHeader() {
  const handleAddWorkout = () => {
    router.push("/workout/create");
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>
          It's your turn, show me what you can do
        </Text>
      </View>
      <Pressable onPress={handleAddWorkout} style={styles.addButton}>
        <Ionicons name="add" size={22} color={Colors.text.inverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    lineHeight: 18,
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
