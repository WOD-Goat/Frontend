import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const screenWidth = Dimensions.get("window").width;

interface WorkoutCardProps {
  title: string;
  exercises: string[];
  rawText?: string;
}

export default function WorkoutCard({ title, exercises, rawText }: WorkoutCardProps) {
  const MAX_VISIBLE_EXERCISES = 3;
  const hasMoreExercises = exercises.length > MAX_VISIBLE_EXERCISES;
  const visibleExercises = hasMoreExercises
    ? exercises.slice(0, MAX_VISIBLE_EXERCISES)
    : exercises;
  const remainingCount = exercises.length - visibleExercises.length;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {rawText ? (
        <Text style={styles.rawText} numberOfLines={4}>{rawText}</Text>
      ) : (
        <View style={styles.exercisesList}>
          {visibleExercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseRow}>
              <View style={styles.bullet} />
              <Text style={styles.exerciseText} numberOfLines={1}>
                {exercise}
              </Text>
            </View>
          ))}
          {hasMoreExercises && (
            <Text style={styles.moreText}>+{remainingCount} more</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.58,
    padding: 14,
  },
  title: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.inverse,
    marginBottom: 10,
  },
  exercisesList: {
    gap: 8,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[500],
  },
  exerciseText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    flex: 1,
  },
  moreText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyXS,
    color: Colors.primary[500],
    marginLeft: 14,
  },
  rawText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
