import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { AssignedWorkoutData, ResultData } from "@/types";
import { formatDate, parseFirebaseDate } from "@/utils";
import { StyleSheet, Text, View } from "react-native";
import Input from "../ui/Input";

interface ResultsViewProps {
  workout: AssignedWorkoutData;
  isEditingResults: boolean;
  editedResults: ResultData[];
  onUpdateResult: (
    index: number,
    field: keyof ResultData,
    value: string,
  ) => void;
}

export default function ResultsView({
  workout,
  isEditingResults,
  editedResults,
  onUpdateResult,
}: ResultsViewProps) {
  if (!workout?.results || workout.results.length === 0) {
    return (
      <View style={styles.emptyResultsContainer}>
        <Text style={styles.emptyResultsText}>
          No results recorded for this workout.
        </Text>
      </View>
    );
  }

  const resultsToDisplay = isEditingResults ? editedResults : workout.results;

  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.completedBadge}>Completed ✅</Text>
      <Text style={styles.completedDateText}>
        {formatDate(parseFirebaseDate(workout.completedAt))}
      </Text>

      {resultsToDisplay.map((result, index) => {
        const wod = workout.wods[result.wodIndex];
        const exercise = wod?.exercises[result.exerciseIndex];
        const originalResult = workout.results[index];

        if (!exercise) return null;

        return (
          <View key={index} style={styles.resultCard}>
            <Text style={styles.resultWodName}>{wod.name}</Text>
            <Text style={styles.resultExerciseName}>{exercise.name}</Text>

            <View style={styles.resultDetails}>
              {originalResult.weight !== null && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Weight (kg)</Text>
                  {isEditingResults ? (
                    <Input
                      value={result.weight?.toString() || ""}
                      onChangeText={(text) =>
                        onUpdateResult(index, "weight", text)
                      }
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  ) : (
                    <Text style={styles.resultValue}>{result.weight} kg</Text>
                  )}
                </View>
              )}
              {originalResult.reps !== null &&
                (exercise.trackingType === "reps" ||
                  exercise.trackingType === "weight_reps") && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Reps</Text>
                    {isEditingResults ? (
                      <Input
                        value={result.reps?.toString() || ""}
                        onChangeText={(text) =>
                          onUpdateResult(index, "reps", text)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    ) : (
                      <Text style={styles.resultValue}>{result.reps}</Text>
                    )}
                  </View>
                )}
              {originalResult.calories !== null &&
                exercise.trackingType === "calories" && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Calories</Text>
                    {isEditingResults ? (
                      <Input
                        value={result.calories?.toString() || ""}
                        onChangeText={(text) =>
                          onUpdateResult(index, "calories", text)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    ) : (
                      <Text style={styles.resultValue}>{result.calories}</Text>
                    )}
                  </View>
                )}
              {originalResult.timeInSeconds !== null && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>
                    {isEditingResults
                      ? "Time (seconds)"
                      : result.timeInSeconds && result.timeInSeconds >= 60
                        ? "Time (min:sec)"
                        : "Time (sec)"}
                  </Text>
                  {isEditingResults ? (
                    <Input
                      value={result.timeInSeconds?.toString() || ""}
                      onChangeText={(text) =>
                        onUpdateResult(index, "timeInSeconds", text)
                      }
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  ) : (
                    <Text style={styles.resultValue}>
                      {result.timeInSeconds
                        ? `${Math.floor(result.timeInSeconds / 60)}:${(result.timeInSeconds % 60).toString().padStart(2, "0")}`
                        : "0:00"}
                    </Text>
                  )}
                </View>
              )}
              {originalResult.distanceMeters !== null && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Distance (meters)</Text>
                  {isEditingResults ? (
                    <Input
                      value={result.distanceMeters?.toString() || ""}
                      onChangeText={(text) =>
                        onUpdateResult(index, "distanceMeters", text)
                      }
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  ) : (
                    <Text style={styles.resultValue}>
                      {result.distanceMeters} m
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    paddingTop: 20,
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 60,
  },
  emptyResultsText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  completedBadge: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  completedDateText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  resultWodName: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  resultExerciseName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  resultDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  resultItem: {
    flex: 1,
    minWidth: "45%",
  },
  resultLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  resultValue: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.primary,
  },
});
