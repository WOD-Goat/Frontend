import { workoutsService } from "@/api/services";
import { Button, ExerciseSearchInput, Input, Page } from "@/components";
import { Colors, Typography } from "@/constants";
import type { StandardExercise, TrackingType } from "@/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  instructions: string;
  trackingType: TrackingType;
  removing?: boolean;
}

interface WOD {
  id: string;
  name: string;
  exercises: Exercise[];
  removing?: boolean;
}

// Animated wrapper for WOD sections
function AnimatedWODSection({
  children,
  removing,
  onRemoveComplete,
}: {
  children: React.ReactNode;
  removing?: boolean;
  onRemoveComplete?: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!removing) {
      // Enter animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, []);

  useEffect(() => {
    if (removing) {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (onRemoveComplete) {
          onRemoveComplete();
        }
      });
    }
  }, [removing]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scaleY: heightAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// Animated wrapper for Exercise sections
function AnimatedExerciseSection({
  children,
  removing,
  onRemoveComplete,
}: {
  children: React.ReactNode;
  removing?: boolean;
  onRemoveComplete?: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!removing) {
      // Enter animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, []);

  useEffect(() => {
    if (removing) {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (onRemoveComplete) {
          onRemoveComplete();
        }
      });
    }
  }, [removing]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scaleY: heightAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function CreateWorkoutScreen() {
  const [wods, setWods] = useState<WOD[]>([
    {
      id: "wod-1",
      name: "",
      exercises: [
        {
          id: "exercise-1",
          exerciseId: "",
          name: "",
          instructions: "",
          trackingType: "reps",
        },
      ],
    },
  ]);
  const [scheduledFor, setScheduledFor] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddWod = () => {
    const newWod: WOD = {
      id: `wod-${Date.now()}`,
      name: "",
      exercises: [
        {
          id: `exercise-${Date.now()}`,
          exerciseId: "",
          name: "",
          instructions: "",
          trackingType: "reps",
        },
      ],
    };
    setWods([...wods, newWod]);
  };

  const handleRemoveWod = (wodId: string) => {
    // Count WODs that are not being removed
    const activeWods = wods.filter((w) => !w.removing);

    // Don't allow removing if it would leave zero WODs
    if (activeWods.length <= 1) return;

    // Mark for removal to trigger exit animation
    setWods(
      wods.map((wod) => (wod.id === wodId ? { ...wod, removing: true } : wod)),
    );
  };

  const handleWodRemoveComplete = (wodId: string) => {
    // Actually remove from state after animation completes
    setWods(wods.filter((wod) => wod.id !== wodId));
  };

  const handleWodNameChange = (wodId: string, name: string) => {
    setWods(wods.map((wod) => (wod.id === wodId ? { ...wod, name } : wod)));
  };

  const handleAddExercise = (wodId: string) => {
    setWods(
      wods.map((wod) =>
        wod.id === wodId
          ? {
              ...wod,
              exercises: [
                ...wod.exercises,
                {
                  id: `exercise-${Date.now()}`,
                  exerciseId: "",
                  name: "",
                  instructions: "",
                  trackingType: "reps",
                },
              ],
            }
          : wod,
      ),
    );
  };

  const handleRemoveExercise = (wodId: string, exerciseId: string) => {
    const wod = wods.find((w) => w.id === wodId);
    if (!wod) return;

    // Count exercises that are not being removed
    const activeExercises = wod.exercises.filter((ex) => !ex.removing);

    // Don't allow removing if it would leave zero exercises
    if (activeExercises.length <= 1) return;

    // Mark for removal to trigger exit animation
    setWods(
      wods.map((w) =>
        w.id === wodId
          ? {
              ...w,
              exercises: w.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, removing: true } : ex,
              ),
            }
          : w,
      ),
    );
  };

  const handleExerciseRemoveComplete = (wodId: string, exerciseId: string) => {
    // Actually remove from state after animation completes
    setWods(
      wods.map((wod) =>
        wod.id === wodId
          ? {
              ...wod,
              exercises: wod.exercises.filter((ex) => ex.id !== exerciseId),
            }
          : wod,
      ),
    );
  };

  const handleExerciseChange = (
    wodId: string,
    exerciseId: string,
    field: "name" | "instructions",
    value: string,
  ) => {
    setWods(
      wods.map((wod) =>
        wod.id === wodId
          ? {
              ...wod,
              exercises: wod.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, [field]: value } : ex,
              ),
            }
          : wod,
      ),
    );
  };

  const handleExerciseSelect = (
    wodId: string,
    exerciseId: string,
    exercise: StandardExercise,
  ) => {
    setWods(
      wods.map((wod) =>
        wod.id === wodId
          ? {
              ...wod,
              exercises: wod.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      exerciseId: exercise.id,
                      name: exercise.name,
                      trackingType: exercise.trackingType,
                      // Keep existing instructions, don't overwrite with description
                    }
                  : ex,
              ),
            }
          : wod,
      ),
    );
  };

  const handleSave = async () => {
    if (loading) return;

    // Filter out items being removed before saving
    const finalWods = wods
      .filter((wod) => !wod.removing)
      .map((wod) => ({
        name: wod.name || "Untitled WOD",
        exercises: wod.exercises
          .filter((ex) => !ex.removing)
          .map(({ exerciseId, name, instructions, trackingType }) => ({
            exerciseId: exerciseId,
            name,
            instructions,
            trackingType,
          })),
      }));

    try {
      setLoading(true);
      const response = await workoutsService.createWorkout({
        scheduledFor: scheduledFor,
        notes: notes.trim() || null,
        wods: finalWods,
        groupId: null,
      });

      if (response.success) {
        router.dismissAll();
        router.replace("/(tabs)/workouts");
      } else {
        Alert.alert("Error", response.message || "Failed to create workout");
      }
    } catch (error: any) {
      console.error("Error creating workout:", error);
      Alert.alert("Error", error.message || "Failed to create workout");
    } finally {
      setLoading(false);
    }
  };

  const isValid = () => {
    return wods.some(
      (wod) =>
        !wod.removing &&
        wod.exercises.some((ex) => !ex.removing && ex.name.trim() !== ""),
    );
  };

  return (
    <Page
      title="Create Workout"
      footer={
        <Button
          title={loading ? "Creating..." : "Create Workout"}
          onPress={handleSave}
          variant="primary"
          size="large"
          fullWidth
          disabled={!isValid() || loading}
        />
      }
    >
      <View style={styles.container}>
        {/* Workout Details */}
        <View style={styles.detailsSection}>
          <Text style={[styles.sectionTitle, Typography.headingSmall]}>
            Workout Details
          </Text>

          <View style={styles.section}>
            <Text style={[styles.label, Typography.bodyMedium]}>
              Scheduled Date
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {scheduledFor.toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <>
                <DateTimePicker
                  value={scheduledFor}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    // On Android, hide immediately after selection
                    if (Platform.OS === "android") {
                      setShowDatePicker(false);
                    }
                    if (selectedDate) {
                      setScheduledFor(selectedDate);
                    }
                  }}
                />
                {/* Done button for iOS */}
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {wods.map((wod, wodIndex) => (
          <AnimatedWODSection
            key={wod.id}
            removing={wod.removing}
            onRemoveComplete={() => handleWodRemoveComplete(wod.id)}
          >
            <View style={styles.wodSection}>
              {/* WOD Header */}
              <View style={styles.wodHeader}>
                <Text style={[styles.wodTitle, Typography.headingMedium]}>
                  WOD {wodIndex + 1}
                </Text>
                {wods.filter((w) => !w.removing).length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveWod(wod.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* WOD Name */}
              <View style={styles.section}>
                <Text style={[styles.label, Typography.bodyMedium]}>
                  WOD Name
                </Text>
                <Input
                  placeholder='e.g., "WOD1" or "Fran"'
                  value={wod.name}
                  onChangeText={(text) => handleWodNameChange(wod.id, text)}
                />
              </View>

              {/* Exercises */}
              <View style={styles.exercisesContainer}>
                <Text style={[styles.sectionTitle, Typography.headingSmall]}>
                  Exercises
                </Text>

                {wod.exercises.map((exercise, exerciseIndex) => (
                  <AnimatedExerciseSection
                    key={exercise.id}
                    removing={exercise.removing}
                    onRemoveComplete={() =>
                      handleExerciseRemoveComplete(wod.id, exercise.id)
                    }
                  >
                    <View style={styles.exerciseSection}>
                      <View style={styles.exerciseHeader}>
                        <Text
                          style={[styles.exerciseLabel, Typography.bodyMedium]}
                        >
                          Exercise {exerciseIndex + 1}
                        </Text>
                        {wod.exercises.filter((ex) => !ex.removing).length >
                          1 && (
                          <TouchableOpacity
                            onPress={() =>
                              handleRemoveExercise(wod.id, exercise.id)
                            }
                            style={styles.removeExerciseButton}
                          >
                            <Text style={styles.removeExerciseText}>×</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <ExerciseSearchInput
                          value={exercise.name}
                          onSelectExercise={(selectedExercise) =>
                            handleExerciseSelect(
                              wod.id,
                              exercise.id,
                              selectedExercise,
                            )
                          }
                          placeholder="Search for an exercise"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Instructions</Text>
                        <Input
                          placeholder="Exercise instructions (e.g., 21-15-9 reps)"
                          value={exercise.instructions}
                          onChangeText={(text) =>
                            handleExerciseChange(
                              wod.id,
                              exercise.id,
                              "instructions",
                              text,
                            )
                          }
                          multiline
                        />
                      </View>

                      {exercise.exerciseId && (
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Tracking Type</Text>
                          <View style={styles.trackingTypeDisplay}>
                            <Text style={styles.trackingTypeDisplayText}>
                              {exercise.trackingType.replace("_", " ")}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </AnimatedExerciseSection>
                ))}

                {/* Add Exercise Button */}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddExercise(wod.id)}
                >
                  <Text style={styles.addButtonText}>+ Add Exercise</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedWODSection>
        ))}

        {/* Add WOD Button */}
        <TouchableOpacity style={styles.addWodButton} onPress={handleAddWod}>
          <Text style={styles.addWodButtonText}>+ Add WOD</Text>
        </TouchableOpacity>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  wodSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  } as ViewStyle,
  wodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  } as ViewStyle,
  wodTitle: {
    color: Colors.text.primary,
    fontWeight: "600",
  } as TextStyle,
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.error[500],
    borderRadius: 6,
  } as ViewStyle,
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  } as TextStyle,
  section: {
    marginBottom: 16,
  } as ViewStyle,
  label: {
    color: Colors.text.primary,
    marginBottom: 8,
    fontWeight: "600",
  } as TextStyle,
  sectionTitle: {
    color: Colors.text.primary,
    marginBottom: 12,
    fontWeight: "600",
  } as TextStyle,
  exercisesContainer: {
    marginTop: 8,
  } as ViewStyle,
  exerciseSection: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  } as ViewStyle,
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
  exerciseLabel: {
    color: Colors.text.primary,
    fontWeight: "600",
  } as TextStyle,
  removeExerciseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error[500],
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  removeExerciseText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 20,
  } as TextStyle,
  inputGroup: {
    marginBottom: 12,
  } as ViewStyle,
  inputLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  } as TextStyle,
  addButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderStyle: "dashed",
  } as ViewStyle,
  addButtonText: {
    color: Colors.primary[500],
    fontSize: 14,
    fontWeight: "600",
  } as TextStyle,
  addWodButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  } as ViewStyle,
  addWodButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  } as TextStyle,
  detailsSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  } as ViewStyle,
  trackingTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  } as ViewStyle,
  trackingTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.text.tertiary,
  } as ViewStyle,
  trackingTypeButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  } as ViewStyle,
  trackingTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "capitalize",
  } as TextStyle,
  trackingTypeTextActive: {
    color: "#000000",
  } as TextStyle,
  trackingTypeDisplay: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    alignSelf: "flex-start",
  } as ViewStyle,
  trackingTypeDisplayText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary[500],
    textTransform: "capitalize",
  } as TextStyle,
  dateButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.text.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  } as ViewStyle,
  dateText: {
    color: Colors.text.primary,
    fontSize: 16,
  } as TextStyle,
  doneButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 8,
  } as ViewStyle,
  doneButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,
});
