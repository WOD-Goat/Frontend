import { workoutsService } from "@/api/services";
import { Button, Page } from "@/components";
import { useToast } from "@/components/lib/toast/ToastProvider";
import ResultsView from "@/components/workouts/ResultsView";
import WorkoutView from "@/components/workouts/WorkoutView";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { AssignedWorkoutData, ResultData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Exercise {
  name: string;
  instructions?: string[];
}

interface WOD {
  id: string;
  title: string;
  exercises: Exercise[];
  completed: boolean;
}

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams();
  const { id } = params;

  const [workout, setWorkout] = useState<AssignedWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wods, setWods] = useState<WOD[]>([]);

  const { showToast } = useToast();

  const [expandedExercises, setExpandedExercises] = useState<{
    [key: string]: boolean;
  }>({});

  // Edit mode state for results
  const [isEditingResults, setIsEditingResults] = useState(false);
  const [editedResults, setEditedResults] = useState<ResultData[]>([]);

  // Edit mode state for workout details
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editedWods, setEditedWods] = useState<WOD[]>([]);

  // Animated values for completion button transitions
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

  // Fetch workout data
  useEffect(() => {
    if (id && typeof id === "string") {
      loadWorkout(id);
    }
  }, [id]);

  const loadWorkout = async (workoutId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workoutsService.getWorkoutById(workoutId);

      if (response.success && response.data) {
        setWorkout(response.data);

        // Transform workout data to WOD format for the UI
        const transformedWods: WOD[] = response.data.wods.map((wod, index) => ({
          id: `wod-${index}`,
          title: wod.name,
          exercises: wod.exercises.map((ex) => ({
            name: ex.name,
            instructions: ex.instructions ? [ex.instructions] : undefined,
          })),
          completed: false,
        }));

        setWods(transformedWods);
      } else {
        setError(response.message || "Failed to load workout");
      }
    } catch (err: any) {
      console.error("Error loading workout:", err);
      setError(err.message || "Failed to load workout");
    } finally {
      setLoading(false);
    }
  };

  // Initialize animated values for each WOD
  wods.forEach((wod) => {
    if (!animatedValues.current[wod.id]) {
      animatedValues.current[wod.id] = new Animated.Value(
        wod.completed ? 1 : 0,
      );
    }
  });

  const toggleExercise = (wodId: string, exerciseIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const key = `${wodId}-${exerciseIndex}`;
    setExpandedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleWODCompletion = (wodId: string) => {
    const wod = wods.find((w) => w.id === wodId);
    if (!wod) return;

    const toValue = wod.completed ? 0 : 1;

    Animated.timing(animatedValues.current[wodId], {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setWods((prev) =>
      prev.map((wod) =>
        wod.id === wodId ? { ...wod, completed: !wod.completed } : wod,
      ),
    );
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await workoutsService.deleteWorkout(
                id as string,
              );

              if (response.success) {
                router.dismissAll();
                router.replace("/(tabs)/");
                showToast({
                  type: "success",
                  label: "Workout deleted successfully!",
                });
              } else {
                showToast({
                  type: "error",
                  label: response.message || "Failed to delete workout",
                });
              }
            } catch (err: any) {
              console.error("Error deleting workout:", err);
              showToast({
                type: "error",
                label: err.message || "Failed to delete workout",
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleEditWorkout = () => {
    if (workout?.completed && workout.results) {
      setEditedResults(JSON.parse(JSON.stringify(workout.results)));
      setIsEditingResults(true);
    } else if (workout) {
      setEditedWods(JSON.parse(JSON.stringify(wods)));
      setIsEditingWorkout(true);
    }
  };

  const handleSaveResults = async () => {
    try {
      setLoading(true);
      const response = await workoutsService.updateWorkout(id as string, {
        results: editedResults,
      });

      if (response.success) {
        setIsEditingResults(false);
        router.dismissAll();
        router.replace("/(tabs)/");
        showToast({
          type: "success",
          label: "Workout results updated successfully!",
        });
      } else {
        showToast({
          type: "error",
          label: response.message || "Failed to update results",
        });
      }
    } catch (err: any) {
      console.error("Error updating results:", err);
      showToast({
        type: "error",
        label: err.message || "Failed to update results",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingResults(false);
    setEditedResults([]);
    setIsEditingWorkout(false);
    setEditedWods([]);
  };

  const handleSaveWorkout = async () => {
    try {
      setLoading(true);

      // Transform edited WODs back to WODData format
      const updatedWods = editedWods.map((wod, wodIndex) => ({
        name: wod.title || "Untitled WOD",
        exercises: wod.exercises.map((ex, exIndex) => {
          // Try to get original exercise data if it exists
          let trackingType = "reps";
          let exerciseId = "";
          if (
            workout &&
            workout.wods[wodIndex] &&
            workout.wods[wodIndex].exercises[exIndex]
          ) {
            const originalEx = workout.wods[wodIndex].exercises[exIndex];
            trackingType = originalEx.trackingType;
            exerciseId = originalEx.exerciseId || "";
          }
          return {
            exerciseId: exerciseId,
            name: ex.name || "Exercise",
            instructions: ex.instructions?.[0] || "",
            trackingType: trackingType as any,
          };
        }),
      }));

      const response = await workoutsService.updateWorkout(id as string, {
        wods: updatedWods,
      });

      if (response.success) {
        router.dismissAll();
        router.replace("/(tabs)/");
        showToast({
          type: "success",
          label: "Workout updated successfully!",
        });
      } else {
        showToast({
          type: "error",
          label: response.message || "Failed to update workout",
        });
      }
    } catch (err: any) {
      console.error("Error updating workout:", err);
      showToast({
        type: "error",
        label: err.message || "Failed to update workout",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWodTitle = (wodId: string, title: string) => {
    setEditedWods((prev) =>
      prev.map((wod) => (wod.id === wodId ? { ...wod, title } : wod)),
    );
  };

  const updateExercise = (
    wodId: string,
    exerciseIndex: number,
    field: "name" | "instructions",
    value: string,
  ) => {
    setEditedWods((prev) =>
      prev.map((wod) => {
        if (wod.id === wodId) {
          const updatedExercises = wod.exercises.map((ex, idx) => {
            if (idx === exerciseIndex) {
              if (field === "name") {
                return { ...ex, name: value };
              } else {
                return { ...ex, instructions: [value] };
              }
            }
            return ex;
          });
          return { ...wod, exercises: updatedExercises };
        }
        return wod;
      }),
    );
  };

  const handleAddWod = () => {
    const newWod: WOD = {
      id: `wod-${Date.now()}`,
      title: "",
      exercises: [
        {
          name: "",
          instructions: [""],
        },
      ],
      completed: false,
    };
    setEditedWods([...editedWods, newWod]);
  };

  const handleRemoveWod = (wodId: string) => {
    if (editedWods.length <= 1) {
      showToast({ type: "error", label: "You must have at least one WOD" });
      return;
    }
    setEditedWods(editedWods.filter((wod) => wod.id !== wodId));
  };

  const handleAddExercise = (wodId: string) => {
    setEditedWods((prev) =>
      prev.map((wod) =>
        wod.id === wodId
          ? {
              ...wod,
              exercises: [
                ...wod.exercises,
                {
                  name: "",
                  instructions: [""],
                },
              ],
            }
          : wod,
      ),
    );
  };

  const handleRemoveExercise = (wodId: string, exerciseIndex: number) => {
    const wod = editedWods.find((w) => w.id === wodId);
    if (!wod) return;

    if (wod.exercises.length <= 1) {
      showToast({
        type: "error",
        label: "Each WOD must have at least one exercise",
      });
      return;
    }

    setEditedWods((prev) =>
      prev.map((w) =>
        w.id === wodId
          ? {
              ...w,
              exercises: w.exercises.filter((_, idx) => idx !== exerciseIndex),
            }
          : w,
      ),
    );
  };

  const updateEditedResult = (
    index: number,
    field: keyof ResultData,
    value: string,
  ) => {
    const numValue =
      value === ""
        ? null
        : field === "weight"
          ? parseFloat(value)
          : parseInt(value);
    setEditedResults((prev) =>
      prev.map((result, i) =>
        i === index ? { ...result, [field]: numValue } : result,
      ),
    );
  };

  if (loading) {
    return (
      <Page
        title="Workout Details"
        scrollable={false}
        contentStyle={{ flex: 1 }}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        title="Workout Details"
        scrollable={false}
        contentStyle={{ flex: 1 }}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={{ marginTop: 16 }}>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </View>
      </Page>
    );
  }

  if (!workout || wods.length === 0) {
    return (
      <Page
        title="Workout Details"
        scrollable={false}
        contentStyle={{ flex: 1 }}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <View style={{ marginTop: 16 }}>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </View>
      </Page>
    );
  }

  const wodsToDisplay = isEditingWorkout ? editedWods : wods;

  // Render completed workout view
  if (workout?.completed) {
    return (
      <Page
        title="Workout Results"
        headerRight={
          !isEditingResults ? (
            <TouchableOpacity onPress={handleEditWorkout}>
              <Ionicons
                name="create-outline"
                size={24}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleCancelEdit}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          )
        }
        footer={
          isEditingResults ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Cancel"
                  size="large"
                  onPress={handleCancelEdit}
                  variant="secondary"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Save Changes"
                  size="large"
                  onPress={handleSaveResults}
                  disabled={loading}
                />
              </View>
            </View>
          ) : undefined
        }
      >
        <ResultsView
          workout={workout}
          isEditingResults={isEditingResults}
          editedResults={editedResults}
          onUpdateResult={updateEditedResult}
        />
      </Page>
    );
  }

  // Render active workout view
  return (
    <Page
      title="Workout Details"
      headerRight={
        <View style={{ flexDirection: "row", gap: 16 }}>
          {!isEditingWorkout ? (
            <TouchableOpacity onPress={handleEditWorkout}>
              <Ionicons
                name="create-outline"
                size={24}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleCancelEdit}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
          {!isEditingWorkout && (
            <TouchableOpacity onPress={handleDeleteWorkout}>
              <Ionicons
                name="trash-outline"
                size={24}
                color={Colors.error[500]}
              />
            </TouchableOpacity>
          )}
        </View>
      }
      footer={
        isEditingWorkout ? (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                title="Cancel"
                size="large"
                onPress={handleCancelEdit}
                variant="secondary"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Save Changes"
                size="large"
                onPress={handleSaveWorkout}
                disabled={loading}
              />
            </View>
          </View>
        ) : (
          <Button
            title="Complete Workout"
            size="large"
            disabled={wods.some((wod) => !wod.completed)}
            onPress={() => {
              router.push({
                pathname: `/workout/results`,
                params: {
                  workoutData: JSON.stringify(workout),
                },
              });
            }}
          />
        )
      }
    >
      <WorkoutView
        wods={wodsToDisplay}
        isEditingWorkout={isEditingWorkout}
        expandedExercises={expandedExercises}
        animatedValues={animatedValues.current}
        onToggleExercise={toggleExercise}
        onToggleWODCompletion={toggleWODCompletion}
        onUpdateWodTitle={updateWodTitle}
        onUpdateExercise={updateExercise}
        onAddWod={handleAddWod}
        onRemoveWod={handleRemoveWod}
        onAddExercise={handleAddExercise}
        onRemoveExercise={handleRemoveExercise}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  errorText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.error[500],
    textAlign: "center",
  },
});
