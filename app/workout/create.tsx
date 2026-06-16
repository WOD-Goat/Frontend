import { authService, workoutsService } from "@/api/services";
import {
  BulletTextArea,
  Button,
  ExerciseSearchInput,
  Input,
  Page,
} from "@/components";
import { VoiceRecorderModal } from "@/components/ai";
import { storage, useGlobalState, useToast } from "@/components/lib";
import { Colors, Typography, responsiveSize } from "@/constants";
import standardExercises from "@/constants/standardExercises.json";
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
import type { VoiceWorkoutResult } from "@/lib/ai/useVoiceWorkout";
import { getVoiceUsage } from "@/lib/voiceUsageStorage";
import type {
  CreateWorkoutData,
  StandardExercise,
  TrackingType,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  unresolved?: boolean;
}

interface WOD {
  id: string;
  name: string;
  exercises: Exercise[];
  rawText?: string;
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

function resolveExercise(
  aiId: string,
  aiName: string,
): StandardExercise | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Exact ID match
  let match = (standardExercises as StandardExercise[]).find(
    (e) => e.id === aiId,
  );
  if (match) return match;

  // 2. Normalized name match
  const normAiName = normalize(aiName);
  match = (standardExercises as StandardExercise[]).find(
    (e) => normalize(e.name) === normAiName,
  );
  if (match) return match;

  // 3. Alias match
  match = (standardExercises as StandardExercise[]).find((e) =>
    (e.aliases ?? []).some((alias) => normalize(alias) === normAiName),
  );
  if (match) return match;

  // 4. Partial containment match (AI name contains or is contained by standard name)
  match = (standardExercises as StandardExercise[]).find(
    (e) =>
      normalize(e.name).includes(normAiName) ||
      normAiName.includes(normalize(e.name)),
  );
  return match ?? null;
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
  const [title, setTitle] = useState<string>("");
  const [scheduledFor, setScheduledFor] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [inputMode, setInputMode] = useState<"structured" | "freetext">(
    "freetext",
  );
  const scrollRef = useRef<ScrollView>(null);
  const wodYPositions = useRef<{ [key: string]: number }>({});
  const { voice } = useLocalSearchParams<{ voice?: string }>();
  const globalState = useGlobalState();
  const { showToast } = useToast();
  const { guardLimit } = useFeatureGuard();

  const handleVoiceMicPress = async () => {
    const { count } = await getVoiceUsage();
    await guardLimit("voiceWorkoutMaxCountPerMonth", count, () =>
      setVoiceModalVisible(true),
    );
  };

  useEffect(() => {
    if (voice === "true") {
      const t = setTimeout(() => handleVoiceMicPress(), 300);
      return () => clearTimeout(t);
    }
  }, [voice]);

  const handleVoiceResult = (result: VoiceWorkoutResult) => {
    const data = result.data as CreateWorkoutData;

    if (inputMode === "freetext") {
      const filled = data.wods.map((w, i) => ({
        id: `wod-voice-${i}-${Date.now()}`,
        name: w.name,
        rawText: w.rawText ?? "",
        exercises: [
          {
            id: `exercise-voice-${i}-0-${Date.now()}`,
            exerciseId: "",
            name: "",
            instructions: "",
            trackingType: "reps" as const,
          },
        ],
      }));
      setWods(filled);
      if (data.scheduledFor) setScheduledFor(new Date(data.scheduledFor));
      if (data.notes) setNotes(data.notes);
      setVoiceModalVisible(false);
      showToast({ type: "success", label: "Workout filled from voice! Review and save." });
      return;
    }

    const filled = data.wods.map((w, i) => ({
      id: `wod-voice-${i}-${Date.now()}`,
      name: w.name,
      exercises: w.exercises.map((ex, j) => {
        const matched = resolveExercise(ex.exerciseId ?? "", ex.name);
        return {
          id: `exercise-voice-${i}-${j}-${Date.now()}`,
          exerciseId: matched?.id ?? "",
          name: matched?.name ?? ex.name,
          instructions: ex.instructions ?? "",
          trackingType: matched?.trackingType ?? ex.trackingType,
          unresolved: matched === null,
        };
      }),
    }));
    setWods(filled);
    if (data.title) setTitle(data.title);
    if (data.scheduledFor) setScheduledFor(new Date(data.scheduledFor));
    if (data.notes) setNotes(data.notes);
    setVoiceModalVisible(false);
    const unresolvedCount = filled
      .flatMap((w) => w.exercises)
      .filter((ex) => ex.unresolved).length;
    showToast({
      type: unresolvedCount > 0 ? "error" : "success",
      label:
        unresolvedCount > 0
          ? `${unresolvedCount} exercise(s) not found — please search manually.`
          : "Workout filled from voice! Review and save.",
    });
  };
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

  const handleWodRawTextChange = (wodId: string, rawText: string) => {
    setWods(wods.map((wod) => (wod.id === wodId ? { ...wod, rawText } : wod)));
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
                      unresolved: false,
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
    const finalWods =
      inputMode === "freetext"
        ? wods
            .filter((wod) => !wod.removing)
            .map((wod) => ({
              name: wod.name || "Untitled WOD",
              rawText: wod.rawText ?? "",
              exercises: [],
            }))
        : wods
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
        title: title.trim() || null,
        scheduledFor: scheduledFor,
        notes: notes.trim() || null,
        wodType: inputMode === "freetext" ? "raw" : "structured",
        wods: finalWods,
        groupId: null,
      });

      if (response.success) {
        authService.getProfile().then(async (res) => {
          await Promise.all([storage.set("user", res.user)]);
          globalState.set("user", res.user);
        });
        showToast({ type: "success", label: "Workout created successfully!" });
        router.dismissAll();
        router.replace("/(tabs)");
      } else {
        showToast({
          type: "error",
          label: response.message || "Failed to create workout",
        });
      }
    } catch (error: any) {
      console.error("Error creating workout:", error);
      showToast({
        type: "error",
        label: error.message || "Failed to create workout",
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = () => {
    if (inputMode === "freetext") {
      return wods.some(
        (wod) => !wod.removing && (wod.rawText ?? "").trim().length > 0,
      );
    }
    const hasUnresolved = wods.some((wod) =>
      wod.exercises.some((ex) => !ex.removing && ex.unresolved),
    );
    if (hasUnresolved) return false;
    return wods.some(
      (wod) =>
        !wod.removing &&
        wod.exercises.some((ex) => !ex.removing && ex.name.trim() !== ""),
    );
  };

  return (
    <>
      <VoiceRecorderModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onResult={handleVoiceResult}
        mode={inputMode}
      />
      <Page
        title="Create Workout"
        scrollRef={scrollRef}
        footer={
          <View style={styles.footerActions}>
            <View style={{ flex: 1 }}>
              <Button
                title={loading ? "Creating..." : "Create Workout"}
                onPress={handleSave}
                variant="primary"
                size="large"
                fullWidth
                disabled={!isValid() || loading}
              />
            </View>
            <TouchableOpacity
              style={styles.voiceFooterButton}
              onPress={handleVoiceMicPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name="mic-outline"
                size={responsiveSize(22)}
                color={Colors.primary[500]}
              />
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.container}>
          {/* Workout Details */}
          <View style={styles.detailsSection}>
            <TextInput
              style={styles.titleInput}
              placeholder="Name this workout..."
              placeholderTextColor={Colors.text.tertiary}
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.fieldDivider} />

            <TouchableOpacity
              style={styles.inlineFieldRow}
              onPress={() => setShowDatePicker((v) => !v)}
              activeOpacity={0.7}
            >
              <View style={styles.dateRowLeft}>
                <Ionicons name="calendar-outline" size={responsiveSize(18)} color={Colors.primary[500]} />
                <View>
                  <Text style={styles.inlineFieldLabel}>Scheduled for</Text>
                  <Text style={styles.dateRowValue}>
                    {scheduledFor.toLocaleDateString("en-GB")}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={responsiveSize(14)} color={Colors.text.secondary} />
            </TouchableOpacity>
            {showDatePicker && (
              <>
                <DateTimePicker
                  value={scheduledFor}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === "android") setShowDatePicker(false);
                    if (selectedDate) setScheduledFor(selectedDate);
                  }}
                />
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

            <View style={styles.fieldDivider} />

            <BulletTextArea
              placeholder="Any notes for this workout..."
              value={notes}
              onChangeText={setNotes}
              minHeight={100}
            />
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeTab,
                inputMode === "freetext" && styles.modeTabActive,
              ]}
              onPress={() => setInputMode("freetext")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeTabText,
                  inputMode === "freetext" && styles.modeTabTextActive,
                ]}
              >
                Free Text
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeTab,
                inputMode === "structured" && styles.modeTabActive,
              ]}
              onPress={() => setInputMode("structured")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeTabText,
                  inputMode === "structured" && styles.modeTabTextActive,
                ]}
              >
                Structured
              </Text>
            </TouchableOpacity>
          </View>

          {wods.map((wod, wodIndex) => (
            <View
              key={wod.id}
              onLayout={(e) => {
                wodYPositions.current[wod.id] = e.nativeEvent.layout.y;
              }}
            >
              <AnimatedWODSection
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
                      placeholder='e.g., "Metcon" or "Strength"'
                      value={wod.name}
                      onChangeText={(text) => handleWodNameChange(wod.id, text)}
                    />
                  </View>

                  {inputMode === "freetext" ? (
                    /* Free text: single textarea per WOD */
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Workout Description</Text>
                      <BulletTextArea
                        inputContainerStyle={styles.freeTextInputContainer}
                        inputStyle={styles.freeTextInput}
                        minHeight={200}
                        placeholder={
                          "Describe this WOD...\n\nE.g. 3 rounds of:\n10 squats\n20 push-ups\n400m run"
                        }
                        value={wod.rawText ?? ""}
                        onChangeText={(text) =>
                          handleWodRawTextChange(wod.id, text)
                        }
                        onFocus={() => {
                          setTimeout(() => {
                            const y =
                              (wodYPositions.current[wod.id] ?? 0) + 100;
                            scrollRef.current?.scrollTo({ y, animated: true });
                          }, 150);
                        }}
                      />
                    </View>
                  ) : (
                    /* Structured: exercise list */
                    <View style={styles.exercisesContainer}>
                      <Text
                        style={[styles.sectionTitle, Typography.headingSmall]}
                      >
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
                                style={[
                                  styles.exerciseLabel,
                                  Typography.bodyMedium,
                                ]}
                              >
                                Exercise {exerciseIndex + 1}
                              </Text>
                              {wod.exercises.filter((ex) => !ex.removing)
                                .length > 1 && (
                                <TouchableOpacity
                                  onPress={() =>
                                    handleRemoveExercise(wod.id, exercise.id)
                                  }
                                  style={styles.removeExerciseButton}
                                >
                                  <Text style={styles.removeExerciseText}>
                                    ×
                                  </Text>
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
                                error={exercise.unresolved}
                              />
                              {exercise.unresolved && (
                                <Text style={styles.exerciseErrorText}>
                                  Exercise not found — please search manually
                                </Text>
                              )}
                            </View>

                            <View style={styles.inputGroup}>
                              <Text style={styles.inputLabel}>
                                Instructions
                              </Text>
                              <BulletTextArea
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
                                minHeight={120}
                              />
                            </View>

                            {exercise.exerciseId && (
                              <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                  Tracking Type
                                </Text>
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

                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddExercise(wod.id)}
                      >
                        <Text style={styles.addButtonText}>+ Add Exercise</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </AnimatedWODSection>
            </View>
          ))}

          <TouchableOpacity style={styles.addWodButton} onPress={handleAddWod}>
            <Text style={styles.addWodButtonText}>+ Add WOD</Text>
          </TouchableOpacity>
        </View>
      </Page>
    </>
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
    fontSize: responsiveSize(12),
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
    fontSize: responsiveSize(18),
    fontWeight: "bold",
    lineHeight: responsiveSize(20),
  } as TextStyle,
  inputGroup: {
    marginBottom: 12,
  } as ViewStyle,
  inputLabel: {
    color: Colors.text.secondary,
    fontSize: responsiveSize(12),
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
    fontSize: responsiveSize(14),
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
    color: "#fff",
    fontSize: responsiveSize(16),
    fontWeight: "700",
  } as TextStyle,
  detailsSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: 16,
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
    fontSize: responsiveSize(12),
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
    fontSize: responsiveSize(12),
    fontWeight: "600",
    color: Colors.primary[500],
    textTransform: "capitalize",
  } as TextStyle,
  exerciseErrorText: {
    fontSize: responsiveSize(11),
    color: Colors.error[500],
    marginTop: 4,
    fontWeight: "500",
  } as TextStyle,
  titleInput: {
    color: Colors.text.primary,
    fontSize: responsiveSize(18),
    fontWeight: "600",
    paddingVertical: 4,
  } as TextStyle,
  fieldDivider: {
    height: 1,
    backgroundColor: Colors.text.tertiary,
    opacity: 0.25,
    marginVertical: 14,
  } as ViewStyle,
  inlineFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  } as ViewStyle,
  inlineFieldLabel: {
    color: Colors.text.secondary,
    fontSize: responsiveSize(13),
    fontWeight: "500",
    marginBottom: 2,
  } as TextStyle,
  dateRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  } as ViewStyle,
  dateRowValue: {
    color: Colors.text.primary,
    fontSize: responsiveSize(15),
    fontWeight: "600",
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
    color: "#fff",
    fontSize: responsiveSize(16),
    fontWeight: "600",
  } as TextStyle,
  footerActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  } as ViewStyle,
  voiceFooterButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[500] + "25",
  } as ViewStyle,
  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  } as ViewStyle,
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  } as ViewStyle,
  modeTabActive: {
    backgroundColor: Colors.primary[500],
  } as ViewStyle,
  modeTabText: {
    fontSize: responsiveSize(14),
    fontWeight: "600",
    color: Colors.text.secondary,
  } as TextStyle,
  modeTabTextActive: {
    color: "#000000",
  } as TextStyle,
  freeTextInputContainer: {
    minHeight: 200,
  } as ViewStyle,
  freeTextInput: {
    color: Colors.text.primary,
  } as TextStyle,
});
