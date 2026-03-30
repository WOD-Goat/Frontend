import { workoutsService } from "@/api/services";
import { Button, Gap, Page } from "@/components";
import { useToast } from "@/components/lib/toast/ToastProvider";
import WorkoutView from "@/components/workouts/WorkoutView";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { AssignedWorkoutData, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { parseFirebaseDate } from "@/utils";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function ExerciseCard({ wod, wodIndex }: { wod: WODData; wodIndex: number }) {
  return (
    <View style={styles.wodCard}>
      <View style={styles.wodCardHeader}>
        <Text style={styles.wodCardTitle}>
          {wod.name || `WOD ${wodIndex + 1}`}
        </Text>
      </View>
      {wod.exercises.map((ex, i) => (
        <View key={i} style={styles.exerciseRow}>
          <View style={styles.exerciseDot} />
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            {ex.instructions ? (
              <Text style={styles.exerciseInstructions}>{ex.instructions}</Text>
            ) : null}
            <View style={styles.trackingBadge}>
              <Text style={styles.trackingBadgeText}>
                {ex.trackingType.replace("_", " ")}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
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

  // Edit mode state for workout details
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editedWods, setEditedWods] = useState<WOD[]>([]);

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

        // Transform workout data to WOD format for edit mode
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
    if (workout) {
      setEditedWods(JSON.parse(JSON.stringify(wods)));
      setIsEditingWorkout(true);
    }
  };

  const handleCancelEdit = () => {
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

  const scheduledDate = parseFirebaseDate(workout.scheduledFor);

  // Render active workout view
  return (
    <Page
      title={workout.title || "Workout Details"}
      showBackButton={true}
      scrollable={true}
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
        ) : workout.completed ? null : (
          <TouchableOpacity
            style={styles.footerButton}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/workout/results",
                params: { workoutData: JSON.stringify(workout) },
              })
            }
          >
            <Ionicons name="barbell-outline" size={18} color="#fff" />
            <Text style={styles.footerButtonText}>Complete Workout</Text>
          </TouchableOpacity>
        )
      }
    >
      {isEditingWorkout ? (
        <WorkoutView
          wods={editedWods}
          isEditingWorkout={true}
          expandedExercises={{}}
          animatedValues={{}}
          onToggleExercise={() => {}}
          onToggleWODCompletion={() => {}}
          onUpdateWodTitle={updateWodTitle}
          onUpdateExercise={updateExercise}
          onAddWod={handleAddWod}
          onRemoveWod={handleRemoveWod}
          onAddExercise={handleAddExercise}
          onRemoveExercise={handleRemoveExercise}
        />
      ) : (
        <>
          {/* Workout header */}
          <View style={styles.workoutHeader}>
            <View style={styles.workoutHeaderTop}>
              <View style={styles.groupBadge}>
                <Ionicons name="person" size={12} color={Colors.primary[500]} />
                <Text style={styles.groupBadgeText}>Personal Workout</Text>
              </View>
              {workout.completed && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={Colors.success[500]} />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              )}
            </View>
            <Text style={styles.workoutDate}>
              {scheduledDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            {workout.notes && (
              <View style={styles.notesBox}>
                <Ionicons
                  name="document-text-outline"
                  size={14}
                  color={Colors.text.secondary}
                />
                <Text style={styles.notesText}>{workout.notes}</Text>
              </View>
            )}
          </View>

          <Gap size={16} />

          {/* WODs */}
          <Text style={styles.sectionHeader}>WODs &amp; Exercises</Text>
          <Gap size={10} />
          {workout.wods.map((wod, i) => (
            <ExerciseCard key={i} wod={wod} wodIndex={i} />
          ))}

          <Gap size={24} />
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  workoutHeader: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "30",
    gap: 8,
    marginTop: 8,
  },
  workoutHeaderTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.success[500] + "18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completedBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
    color: Colors.success[500],
  },
  groupBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primary[500] + "18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  groupBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
    color: Colors.primary[500],
  },
  workoutDate: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  notesBox: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    paddingTop: 4,
  },
  notesText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  sectionHeader: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  wodCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  wodCardHeader: { marginBottom: 10 },
  wodCardTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  exerciseRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[500],
    marginTop: 7,
  },
  exerciseInfo: { flex: 1, gap: 4 },
  exerciseName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  exerciseInstructions: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  trackingBadge: {
    backgroundColor: Colors.primary[500] + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  trackingBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
    color: Colors.primary[500],
    textTransform: "capitalize",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary[500],
    borderRadius: 14,
    paddingVertical: 14,
  },
  footerButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: "#fff",
  },
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
