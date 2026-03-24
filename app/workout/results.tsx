import { authService, workoutsService } from "@/api/services";
import { BottomSheetSelect, Button, Input, Page } from "@/components";
import { storage, useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { AssignedWorkoutData, ResultData, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResultEntry {
  id: string;
  wodIndex: number;
  exerciseIndex: number;
  reps: string;
  weight: string;
  timeMins: string;
  timeSecs: string;
  distanceKm: string;
  calories: string;
}

export default function WorkoutResultsScreen() {
  const params = useLocalSearchParams();
  const workoutData: AssignedWorkoutData = JSON.parse(
    params.workoutData as string,
  );
  const wods: WODData[] = workoutData.wods;

  const [results, setResults] = useState<ResultEntry[]>([
    {
      id: "result-1",
      wodIndex: 0,
      exerciseIndex: 0,
      reps: "",
      weight: "",
      timeMins: "",
      timeSecs: "",
      distanceKm: "",
      calories: "",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const globalState = useGlobalState();
  const { showToast } = useToast();
  const addResultEntry = () => {
    // Find first WOD and exercise combination that hasn't been selected yet
    let newWodIndex = 0;
    let newExerciseIndex = 0;

    // Get all currently selected WOD+exercise combinations
    const selectedCombinations = results.map(
      (r) => `${r.wodIndex}-${r.exerciseIndex}`,
    );

    // Find first available combination
    found: for (let wodIdx = 0; wodIdx < wods.length; wodIdx++) {
      const wod = wods[wodIdx];
      for (let exIdx = 0; exIdx < wod.exercises.length; exIdx++) {
        const combo = `${wodIdx}-${exIdx}`;
        if (!selectedCombinations.includes(combo)) {
          newWodIndex = wodIdx;
          newExerciseIndex = exIdx;
          break found;
        }
      }
    }

    setResults([
      ...results,
      {
        id: `result-${Date.now()}`,
        wodIndex: newWodIndex,
        exerciseIndex: newExerciseIndex,
        reps: "",
        weight: "",
        timeMins: "",
        timeSecs: "",
        distanceKm: "",
        calories: "",
      },
    ]);
  };

  const removeResultEntry = (id: string) => {
    if (results.length === 1) return; // Keep at least one entry
    setResults(results.filter((r) => r.id !== id));
  };

  const updateResult = (
    id: string,
    field: keyof ResultEntry,
    value: string | number,
  ) => {
    setResults(
      results.map((r) => {
        if (r.id === id) {
          // Keep wodIndex and exerciseIndex as numbers, others as strings
          const updatedValue =
            field === "wodIndex" || field === "exerciseIndex"
              ? value
              : value.toString();

          // If wodIndex changes, reset exerciseIndex to first available exercise
          if (field === "wodIndex") {
            const newWodIndex = value as number;
            const selectedExercises = results
              .filter((res) => res.id !== id && res.wodIndex === newWodIndex)
              .map((res) => res.exerciseIndex);

            // Find first available exercise index (not already selected by another result)
            const availableExercises = wods[newWodIndex]?.exercises || [];
            const firstAvailableIndex = availableExercises.findIndex(
              (_, idx) => !selectedExercises.includes(idx),
            );

            return {
              ...r,
              wodIndex: updatedValue as number,
              exerciseIndex:
                firstAvailableIndex !== -1 ? firstAvailableIndex : 0,
            };
          }

          return { ...r, [field]: updatedValue };
        }
        return r;
      }),
    );
  };

  const getExercise = (wodIndex: number, exerciseIndex: number) => {
    return wods[wodIndex]?.exercises[exerciseIndex];
  };

  // Get available exercises for a specific result entry, excluding already selected ones
  const getAvailableExercises = (currentResultId: string, wodIndex: number) => {
    const wod = wods[wodIndex];
    if (!wod) return [];

    // Get all selected exercises from other result entries for this WOD
    const selectedExercises = results
      .filter((r) => r.id !== currentResultId && r.wodIndex === wodIndex)
      .map((r) => r.exerciseIndex);

    // Filter out already selected exercises
    return wod.exercises
      .map((exercise, idx) => ({
        exercise,
        index: idx,
      }))
      .filter(({ index }) => !selectedExercises.includes(index))
      .map(({ exercise, index }) => ({
        label: exercise.name,
        value: index,
      }));
  };

  // Check if there are any exercises available across all WODs
  const hasAvailableExercises = () => {
    const totalExercises = wods.reduce(
      (sum, wod) => sum + wod.exercises.length,
      0,
    );
    return results.length < totalExercises;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate each result entry
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const exercise = getExercise(result.wodIndex, result.exerciseIndex);

        if (!exercise) {
          showToast({ type: "error", label: `Invalid exercise selection` });
          setSubmitting(false);
          return;
        }

        // Validate based on tracking type
        switch (exercise.trackingType) {
          case "weight_reps":
            if (!result.weight && !result.reps) {
              showToast({
                type: "error",
                label: `${exercise.name} : Please enter weight or reps`,
              });
              setSubmitting(false);
              return;
            }
            if (parseFloat(result.weight) < 0 || parseInt(result.reps) <= 0) {
              showToast({
                type: "error",
                label: `${exercise.name} : Weight and reps must be greater than 0`,
              });
              setSubmitting(false);
              return;
            }
            break;

          case "reps":
            if (!result.reps) {
              showToast({
                type: "error",
                label: `${exercise.name} : Please enter reps`,
              });
              setSubmitting(false);
              return;
            }
            if (parseInt(result.reps) <= 0) {
              showToast({
                type: "error",
                label: `${exercise.name} : Reps must be greater than 0`,
              });
              setSubmitting(false);
              return;
            }
            break;

          case "time":
            if (!result.timeMins && !result.timeSecs) {
              showToast({
                type: "error",
                label: `${exercise.name} : Please enter time`,
              });
              setSubmitting(false);
              return;
            }
            if (
              (parseInt(result.timeMins || "0") === 0 &&
                parseInt(result.timeSecs || "0") === 0) ||
              parseInt(result.timeSecs || "0") > 59
            ) {
              showToast({
                type: "error",
                label: `${exercise.name} : Please enter a valid time`,
              });
              setSubmitting(false);
              return;
            }
            break;

          case "distance":
            if (!result.distanceKm) {
              showToast({
                type: "error",
                label: `${exercise.name} : Please enter distance`,
              });
              setSubmitting(false);
              return;
            }
            if (parseFloat(result.distanceKm) <= 0) {
              showToast({
                type: "error",
                label: `${exercise.name} : Distance must be greater than 0`,
              });
              setSubmitting(false);
              return;
            }
            break;

          case "pace":
            if ((!result.timeMins && !result.timeSecs) || !result.distanceKm) {
              showToast({
                type: "error",
                label: `${exercise.name} : Please enter both time and distance`,
              });
              setSubmitting(false);
              return;
            }
            if (
              (parseInt(result.timeMins || "0") === 0 &&
                parseInt(result.timeSecs || "0") === 0) ||
              parseInt(result.timeSecs || "0") > 59 ||
              parseFloat(result.distanceKm) <= 0
            ) {
              showToast({
                type: "error",
                label: `${exercise.name} : Please enter valid time and distance`,
              });
              setSubmitting(false);
              return;
            }
            break;

          case "calories":
            if (!result.calories) {
              showToast({
                type: "error",
                label: `${exercise.name} : Please enter calories`,
              });
              setSubmitting(false);
              return;
            }
            if (parseInt(result.calories) <= 0) {
              showToast({
                type: "error",
                label: `${exercise.name} : Calories must be greater than 0`,
              });
              setSubmitting(false);
              return;
            }
            break;
        }
      }

      // Format results for API
      const formattedResults: ResultData[] = results.map((r) => {
        const totalSeconds =
          parseInt(r.timeMins || "0") * 60 + parseInt(r.timeSecs || "0");
        const meters = r.distanceKm
          ? Math.round(parseFloat(r.distanceKm) * 1000)
          : null;
        return {
          wodIndex: r.wodIndex,
          exerciseIndex: r.exerciseIndex,
          reps: r.reps ? parseInt(r.reps) : null,
          weight: r.weight ? parseFloat(r.weight) : null,
          timeInSeconds: totalSeconds > 0 ? totalSeconds : null,
          distanceMeters: meters,
          calories: r.calories ? parseInt(r.calories) : null,
        };
      });

      const response = await workoutsService.completeWorkout(
        workoutData.id!,
        formattedResults,
      );

      if (response.success) {
        authService.getProfile().then(async (res) => {
          await Promise.all([storage.set("user", res.user)]);
          globalState.set("user", res.user);
        });
        router.dismissAll();
        router.replace("/(tabs)/");
        showToast({
          type: "success",
          label: "Workout results submitted successfully!",
        });
      } else {
        showToast({
          type: "error",
          label: response.message || "Failed to submit results",
        });
      }
    } catch (error: any) {
      console.error("Error submitting results:", error);
      showToast({
        type: "error",
        label: error.message || "Failed to submit results",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderInputFields = (result: ResultEntry) => {
    const exercise = getExercise(result.wodIndex, result.exerciseIndex);
    if (!exercise) return null;

    switch (exercise.trackingType) {
      case "weight_reps":
        return (
          <>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Weight (KGs)</Text>
                <Input
                  placeholder="0"
                  value={result.weight}
                  onChangeText={(text) =>
                    updateResult(result.id, "weight", text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Reps</Text>
                <Input
                  placeholder="0"
                  value={result.reps}
                  onChangeText={(text) => updateResult(result.id, "reps", text)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </>
        );

      case "reps":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <Input
              placeholder="0"
              value={result.reps}
              onChangeText={(text) => updateResult(result.id, "reps", text)}
              keyboardType="numeric"
            />
          </View>
        );

      case "time":
        return (
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Minutes</Text>
              <Input
                placeholder="0"
                value={result.timeMins}
                onChangeText={(text) =>
                  updateResult(result.id, "timeMins", text)
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Seconds</Text>
              <Input
                placeholder="0"
                value={result.timeSecs}
                onChangeText={(text) =>
                  updateResult(result.id, "timeSecs", text)
                }
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case "distance":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Distance (km)</Text>
            <Input
              placeholder="0.0"
              value={result.distanceKm}
              onChangeText={(text) =>
                updateResult(result.id, "distanceKm", text)
              }
              keyboardType="decimal-pad"
            />
          </View>
        );

      case "pace":
        return (
          <>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Minutes</Text>
                <Input
                  placeholder="0"
                  value={result.timeMins}
                  onChangeText={(text) =>
                    updateResult(result.id, "timeMins", text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Seconds</Text>
                <Input
                  placeholder="0"
                  value={result.timeSecs}
                  onChangeText={(text) =>
                    updateResult(result.id, "timeSecs", text)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Distance (km)</Text>
              <Input
                placeholder="0.0"
                value={result.distanceKm}
                onChangeText={(text) =>
                  updateResult(result.id, "distanceKm", text)
                }
                keyboardType="decimal-pad"
              />
            </View>
          </>
        );

      case "calories":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Calories</Text>
            <Input
              placeholder="0"
              value={result.calories}
              onChangeText={(text) => updateResult(result.id, "calories", text)}
              keyboardType="numeric"
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Page
      title="Log Results"
      showBackButton={true}
      footer={
        <Button
          title={submitting ? "Submitting..." : "Complete Workout"}
          size="large"
          onPress={handleSubmit}
          disabled={submitting}
        />
      }
    >
      <Text style={styles.subtitle}>
        Log your results for each exercise below
      </Text>

      {results.map((result, index) => (
        <View key={result.id} style={styles.resultCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Result {index + 1}</Text>
            {results.length > 1 && (
              <TouchableOpacity
                onPress={() => removeResultEntry(result.id)}
                style={styles.removeButton}
              >
                <Ionicons name="trash" size={20} color={Colors.error[500]} />
              </TouchableOpacity>
            )}
          </View>

          {/* WOD Selector */}
          <BottomSheetSelect
            label="WOD"
            placeholder="Select WOD"
            value={result.wodIndex}
            options={wods.map((wod, idx) => ({
              label: wod.name || `WOD ${idx + 1}`,
              value: idx,
            }))}
            onValueChange={(value) =>
              updateResult(result.id, "wodIndex", value)
            }
          />

          {/* Exercise Selector */}
          <BottomSheetSelect
            label="Exercise"
            placeholder="Select Exercise"
            value={result.exerciseIndex}
            options={getAvailableExercises(result.id, result.wodIndex)}
            onValueChange={(value) =>
              updateResult(result.id, "exerciseIndex", value)
            }
          />

          {/* Dynamic Input Fields Based on Tracking Type */}
          {renderInputFields(result)}
        </View>
      ))}

      {/* Add More Button - Only show if there are available exercises */}
      {hasAvailableExercises() ? (
        <TouchableOpacity style={styles.addButton} onPress={addResultEntry}>
          <Ionicons name="add-circle" size={24} color={Colors.primary[500]} />
          <Text style={styles.addButtonText}>Add Another Result</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={20}
            color={Colors.text.secondary}
          />
          <Text style={styles.infoText}>All exercises have been logged</Text>
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyLG,
    color: Colors.text.primary,
  },
  removeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderStyle: "dashed",
  },
  addButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
});
