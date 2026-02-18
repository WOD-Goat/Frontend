import { Colors, FontFamilies, FontSizes } from "@/constants";
import { StyleSheet, Text, View } from "react-native";

interface WorkoutHeaderProps {
  subtitle?: string;
}

export default function WorkoutHeader({
  subtitle = "It's your turn, show me what you can do",
}: WorkoutHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingRight: 16,
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
