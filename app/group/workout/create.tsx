import { groupsService } from "@/api/services";
import {
  BulletTextArea,
  Button,
  ExerciseSearchInput,
  Input,
  Page,
} from "@/components";
import { VoiceRecorderModal } from "@/components/ai";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, Typography, responsiveSize } from "@/constants";
import standardExercises from "@/constants/standardExercises.json";
import type { VoiceWorkoutResult } from "@/lib/ai/useVoiceWorkout";
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
  Switch,
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
      ]).start(() => onRemoveComplete?.());
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
      ]).start(() => onRemoveComplete?.());
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
  let match = (standardExercises as StandardExercise[]).find(
    (e) => e.id === aiId,
  );
  if (match) return match;
  const normAiName = normalize(aiName);
  match = (standardExercises as StandardExercise[]).find(
    (e) => normalize(e.name) === normAiName,
  );
  if (match) return match;
  match = (standardExercises as StandardExercise[]).find((e) =>
    (e.aliases ?? []).some((alias) => normalize(alias) === normAiName),
  );
  if (match) return match;
  match = (standardExercises as StandardExercise[]).find(
    (e) =>
      normalize(e.name).includes(normAiName) ||
      normAiName.includes(normalize(e.name)),
  );
  return match ?? null;
}

export default function CreateGroupWorkoutScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
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
  const [title, setTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [publishMode, setPublishMode] = useState<"now" | "scheduled">("now");
  const [publishedAt, setPublishedAt] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [showPublishDatePicker, setShowPublishDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [inputMode, setInputMode] = useState<"structured" | "freetext">(
    "freetext",
  );
  const scrollRef = useRef<ScrollView>(null);
  const wodYPositions = useRef<{ [key: string]: number }>({});
  const { showToast } = useToast();

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
    setWods([
      ...wods,
      {
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
      },
    ]);
  };

  const handleRemoveWod = (wodId: string) => {
    if (wods.filter((w) => !w.removing).length <= 1) return;
    setWods(wods.map((w) => (w.id === wodId ? { ...w, removing: true } : w)));
  };

  const handleWodRemoveComplete = (wodId: string) => {
    setWods(wods.filter((w) => w.id !== wodId));
  };

  const handleWodNameChange = (wodId: string, name: string) => {
    setWods(wods.map((w) => (w.id === wodId ? { ...w, name } : w)));
  };

  const handleWodRawTextChange = (wodId: string, rawText: string) => {
    setWods(wods.map((w) => (w.id === wodId ? { ...w, rawText } : w)));
  };

  const handleAddExercise = (wodId: string) => {
    setWods(
      wods.map((w) =>
        w.id === wodId
          ? {
              ...w,
              exercises: [
                ...w.exercises,
                {
                  id: `exercise-${Date.now()}`,
                  exerciseId: "",
                  name: "",
                  instructions: "",
                  trackingType: "reps",
                },
              ],
            }
          : w,
      ),
    );
  };

  const handleRemoveExercise = (wodId: string, exerciseId: string) => {
    const wod = wods.find((w) => w.id === wodId);
    if (!wod || wod.exercises.filter((ex) => !ex.removing).length <= 1) return;
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
    setWods(
      wods.map((w) =>
        w.id === wodId
          ? {
              ...w,
              exercises: w.exercises.filter((ex) => ex.id !== exerciseId),
            }
          : w,
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
      wods.map((w) =>
        w.id === wodId
          ? {
              ...w,
              exercises: w.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, [field]: value } : ex,
              ),
            }
          : w,
      ),
    );
  };

  const handleExerciseSelect = (
    wodId: string,
    exerciseId: string,
    exercise: StandardExercise,
  ) => {
    setWods(
      wods.map((w) =>
        w.id === wodId
          ? {
              ...w,
              exercises: w.exercises.map((ex) =>
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
          : w,
      ),
    );
  };

  const isValid = () => {
    if (inputMode === "freetext")
      return wods.some(
        (w) => !w.removing && (w.rawText ?? "").trim().length > 0,
      );
    if (
      wods.some((w) => w.exercises.some((ex) => !ex.removing && ex.unresolved))
    )
      return false;
    return wods.some(
      (w) =>
        !w.removing &&
        w.exercises.some((ex) => !ex.removing && ex.name.trim() !== ""),
    );
  };

  const handleSave = async () => {
    if (loading || !groupId) return;
    const finalWods =
      inputMode === "freetext"
        ? wods
            .filter((w) => !w.removing)
            .map((w) => ({
              name: w.name || "Workout Of The Day",
              rawText: w.rawText ?? "",
              exercises: [],
            }))
        : wods
            .filter((w) => !w.removing)
            .map((w) => ({
              name: w.name || "Workout Of The Day",
              exercises: w.exercises
                .filter((ex) => !ex.removing)
                .map(({ exerciseId, name, instructions, trackingType }) => ({
                  exerciseId,
                  name,
                  instructions,
                  trackingType,
                })),
            }));

    try {
      setLoading(true);
      const response = await groupsService.createGroupWorkout(groupId, {
        title: title.trim() || null,
        scheduledFor,
        notes: notes.trim() || null,
        publishedAt: publishMode === "scheduled" ? publishedAt.toISOString() : null,
        wodType: inputMode === "freetext" ? "raw" : "structured",
        wods: finalWods,
      });
      if (response.success) {
        showToast({ type: "success", label: "Workout posted to group!" });
        router.dismissAll();
        router.replace("/(tabs)/groups");
      } else {
        showToast({
          type: "error",
          label: response.message || "Failed to post workout",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        label: err.message || "Failed to post workout",
      });
    } finally {
      setLoading(false);
    }
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
        title="Post Workout"
        showBackButton={true}
        scrollRef={scrollRef}
        footer={
          <View style={styles.footerActions}>
            <View style={{ flex: 1 }}>
              <Button
                title={loading ? "Posting..." : "Post Workout"}
                onPress={handleSave}
                variant="primary"
                size="large"
                fullWidth
                disabled={!isValid() || loading}
              />
            </View>
            <TouchableOpacity
              style={styles.voiceFooterButton}
              onPress={() => setVoiceModalVisible(true)}
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
          {/* Details section */}
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
                    {scheduledFor.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
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
                  onChange={(_, selectedDate) => {
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
              placeholder="Leave notes for your group — scaling options, warm-up tips, reminders..."
              value={notes}
              onChangeText={setNotes}
              minHeight={100}
            />

            <View style={styles.fieldDivider} />

            <View style={styles.publishSwitchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.publishSwitchLabel}>Schedule Publishing</Text>
                <Text style={styles.publishSwitchSubtext}>
                  {publishMode === "now" ? "Visible to members right away" : "Visible from the selected date"}
                </Text>
              </View>
              <Switch
                value={publishMode === "scheduled"}
                onValueChange={(val) => setPublishMode(val ? "scheduled" : "now")}
                trackColor={{ false: Colors.background.primary, true: Colors.primary[500] }}
                thumbColor={publishMode === "scheduled" ? "#ffffff" : Colors.text.secondary}
              />
            </View>
            {publishMode === "scheduled" && (
              <>
                <TouchableOpacity
                  style={[styles.inlineFieldRow, { marginTop: 14 }]}
                  onPress={() => setShowPublishDatePicker((v) => !v)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateRowLeft}>
                    <Ionicons name="calendar-outline" size={responsiveSize(18)} color={Colors.primary[500]} />
                    <View>
                      <Text style={styles.inlineFieldLabel}>Publish on</Text>
                      <Text style={styles.dateRowValue}>
                        {publishedAt.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={responsiveSize(14)} color={Colors.text.secondary} />
                </TouchableOpacity>
                {showPublishDatePicker && (
                  <>
                    <DateTimePicker
                      value={publishedAt}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      minimumDate={new Date()}
                      onChange={(_, selectedDate) => {
                        if (Platform.OS === "android") setShowPublishDatePicker(false);
                        if (selectedDate) setPublishedAt(selectedDate);
                      }}
                    />
                    {Platform.OS === "ios" && (
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setShowPublishDatePicker(false)}
                      >
                        <Text style={styles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )}
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

          {/* WODs */}
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
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Workout Description</Text>
                      <BulletTextArea
                        inputContainerStyle={styles.freeTextInputContainer}
                        inputStyle={styles.freeTextInput}
                        placeholder={
                          "Describe this WOD...\n\nE.g. 3 rounds of:\n10 squats\n20 push-ups\n400m run"
                        }
                        value={wod.rawText ?? ""}
                        onChangeText={(text) =>
                          handleWodRawTextChange(wod.id, text)
                        }
                        minHeight={200}
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
                                onSelectExercise={(sel) =>
                                  handleExerciseSelect(wod.id, exercise.id, sel)
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
                                placeholder="e.g., 21-15-9 reps"
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
  container: { flex: 1 } as ViewStyle,
  detailsSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: 16,
  } as ViewStyle,
  sectionTitle: {
    color: Colors.text.primary,
    marginBottom: 12,
    fontWeight: "600",
  } as TextStyle,
  label: {
    color: Colors.text.primary,
    marginBottom: 8,
    fontWeight: "600",
  } as TextStyle,
  section: { marginBottom: 16 } as ViewStyle,
  inputGroup: { marginBottom: 12 } as ViewStyle,
  inputLabel: {
    color: Colors.text.secondary,
    fontSize: responsiveSize(12),
    marginBottom: 4,
    fontWeight: "500",
  } as TextStyle,
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
  wodTitle: { color: Colors.text.primary, fontWeight: "600" } as TextStyle,
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.error[500],
    borderRadius: 6,
  } as ViewStyle,
  removeButtonText: {
    color: "#fff",
    fontSize: responsiveSize(12),
    fontWeight: "600",
  } as TextStyle,
  exercisesContainer: { marginTop: 8 } as ViewStyle,
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
  exerciseLabel: { color: Colors.text.primary, fontWeight: "600" } as TextStyle,
  removeExerciseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error[500],
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  removeExerciseText: {
    color: "#fff",
    fontSize: responsiveSize(18),
    fontWeight: "bold",
    lineHeight: responsiveSize(20),
  } as TextStyle,
  exerciseErrorText: {
    fontSize: responsiveSize(11),
    color: Colors.error[500],
    marginTop: 4,
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
    fontSize: responsiveSize(16),
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
  publishSwitchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  publishSwitchLabel: {
    color: Colors.text.primary,
    fontSize: responsiveSize(14),
    fontWeight: "600",
  } as TextStyle,
  publishSwitchSubtext: {
    color: Colors.text.secondary,
    fontSize: responsiveSize(12),
    marginTop: 2,
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
  inlineFieldRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  } as ViewStyle,
  inlineFieldValue: {
    color: Colors.text.primary,
    fontSize: responsiveSize(13),
    fontWeight: "500",
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
});
