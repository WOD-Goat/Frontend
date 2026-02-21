import { Button } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function WorkoutHeader() {
  const handleAddWorkout = () => {
    router.push("/workout/create");
  };

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>
          It's your turn, show me what you can do
        </Text>
      </View>
      <View>
        <Button
          title="+"
          onPress={handleAddWorkout}
          variant="primary"
          size="small"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subcontainer: {
    paddingVertical: 16,
    paddingRight: 16,
    flex: 1,
  },
  title: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    lineHeight: 20,
  },
});
