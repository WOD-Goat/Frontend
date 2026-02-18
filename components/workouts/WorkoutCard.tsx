import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const screenWidth = Dimensions.get("window").width;

interface WorkoutCardProps {
  title: string;
  exercises: string[];
}

export default function WorkoutCard({ title, exercises }: WorkoutCardProps) {
  const MAX_VISIBLE_EXERCISES = 4;
  const hasMoreExercises = exercises.length > MAX_VISIBLE_EXERCISES;
  const visibleExercises = hasMoreExercises
    ? exercises.slice(0, MAX_VISIBLE_EXERCISES)
    : exercises;
  const remainingCount = exercises.length - visibleExercises.length;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.exercisesBox}>
        {visibleExercises.map((exercise, index) => (
          <Text key={index} style={styles.exercise}>
            {exercise}
          </Text>
        ))}
        {hasMoreExercises && (
          <Text style={styles.moreText}>+{remainingCount} more</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    width: screenWidth * 0.6,
    alignItems: "center",
    padding: 8,
  },
  title: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  exercisesBox: {
    width: "100%",
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderRadius: 20,
    padding: 12,
    backgroundColor: "transparent",
    gap: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  exercise: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: 18,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  moreText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: 12,
    color: Colors.primary[500],
  },
});
