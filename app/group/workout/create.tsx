import { groupsService } from "@/api/services";
import { Button, ExerciseSearchInput, Input, Page } from "@/components";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, Typography, responsiveSize } from "@/constants";
import type { StandardExercise, TrackingType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
  unresolved?: boolean;
}

interface WOD {
  id: string;
  name: string;
  exercises: Exercise[];
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
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  }, []);

  useEffect(() => {
    if (removing) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: -20, duration: 250, useNativeDriver: false }),
        Animated.timing(heightAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
      ]).start(() => onRemoveComplete?.());
    }
  }, [removing]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scaleY: heightAnim }] }}>
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
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
      ]).start();
    }
  }, []);

  useEffect(() => {
    if (removing) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: 10, duration: 200, useNativeDriver: false }),
        Animated.timing(heightAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      ]).start(() => onRemoveComplete?.());
    }
  }, [removing]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scaleY: heightAnim }] }}>
      {children}
    </Animated.View>
  );
}

export default function CreateGroupWorkoutScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [wods, setWods] = useState<WOD[]>([
    {
      id: "wod-1",
      name: "",
      exercises: [{ id: "exercise-1", exerciseId: "", name: "", instructions: "", trackingType: "reps" }],
    },
  ]);
  const [title, setTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleAddWod = () => {
    setWods([...wods, {
      id: `wod-${Date.now()}`,
      name: "",
      exercises: [{ id: `exercise-${Date.now()}`, exerciseId: "", name: "", instructions: "", trackingType: "reps" }],
    }]);
  };

  const handleRemoveWod = (wodId: string) => {
    if (wods.filter((w) => !w.removing).length <= 1) return;
    setWods(wods.map((w) => w.id === wodId ? { ...w, removing: true } : w));
  };

  const handleWodRemoveComplete = (wodId: string) => {
    setWods(wods.filter((w) => w.id !== wodId));
  };

  const handleWodNameChange = (wodId: string, name: string) => {
    setWods(wods.map((w) => w.id === wodId ? { ...w, name } : w));
  };

  const handleAddExercise = (wodId: string) => {
    setWods(wods.map((w) =>
      w.id === wodId
        ? { ...w, exercises: [...w.exercises, { id: `exercise-${Date.now()}`, exerciseId: "", name: "", instructions: "", trackingType: "reps" }] }
        : w,
    ));
  };

  const handleRemoveExercise = (wodId: string, exerciseId: string) => {
    const wod = wods.find((w) => w.id === wodId);
    if (!wod || wod.exercises.filter((ex) => !ex.removing).length <= 1) return;
    setWods(wods.map((w) =>
      w.id === wodId
        ? { ...w, exercises: w.exercises.map((ex) => ex.id === exerciseId ? { ...ex, removing: true } : ex) }
        : w,
    ));
  };

  const handleExerciseRemoveComplete = (wodId: string, exerciseId: string) => {
    setWods(wods.map((w) =>
      w.id === wodId ? { ...w, exercises: w.exercises.filter((ex) => ex.id !== exerciseId) } : w,
    ));
  };

  const handleExerciseChange = (wodId: string, exerciseId: string, field: "name" | "instructions", value: string) => {
    setWods(wods.map((w) =>
      w.id === wodId
        ? { ...w, exercises: w.exercises.map((ex) => ex.id === exerciseId ? { ...ex, [field]: value } : ex) }
        : w,
    ));
  };

  const handleExerciseSelect = (wodId: string, exerciseId: string, exercise: StandardExercise) => {
    setWods(wods.map((w) =>
      w.id === wodId
        ? { ...w, exercises: w.exercises.map((ex) => ex.id === exerciseId ? { ...ex, exerciseId: exercise.id, name: exercise.name, trackingType: exercise.trackingType, unresolved: false } : ex) }
        : w,
    ));
  };

  const isValid = () => {
    if (wods.some((w) => w.exercises.some((ex) => !ex.removing && ex.unresolved))) return false;
    return wods.some((w) => !w.removing && w.exercises.some((ex) => !ex.removing && ex.name.trim() !== ""));
  };

  const handleSave = async () => {
    if (loading || !groupId) return;
    const finalWods = wods
      .filter((w) => !w.removing)
      .map((w) => ({
        name: w.name || "Untitled WOD",
        exercises: w.exercises
          .filter((ex) => !ex.removing)
          .map(({ exerciseId, name, instructions, trackingType }) => ({ exerciseId, name, instructions, trackingType })),
      }));

    try {
      setLoading(true);
      const response = await groupsService.createGroupWorkout(groupId, {
        title: title.trim() || null,
        scheduledFor,
        notes: notes.trim() || null,
        wods: finalWods,
      });
      if (response.success) {
        showToast({ type: "success", label: "Workout posted to group!" });
        router.dismissAll();
        router.replace("/(tabs)/groups");
      } else {
        showToast({ type: "error", label: response.message || "Failed to post workout" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to post workout" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      title="Post Workout"
      showBackButton={true}
      footer={
        <Button
          title={loading ? "Posting..." : "Post Workout"}
          onPress={handleSave}
          variant="primary"
          size="large"
          fullWidth
          disabled={!isValid() || loading}
        />
      }
    >
      <View style={styles.container}>
        {/* Details section */}
        <View style={styles.detailsSection}>
          <Text style={[styles.sectionTitle, Typography.headingSmall]}>
            Workout Details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title (optional)</Text>
            <Input
              placeholder='e.g., "Murph" or "Monday Strength"'
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Scheduled Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
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
                  onChange={(_, selectedDate) => {
                    if (Platform.OS === "android") setShowDatePicker(false);
                    if (selectedDate) setScheduledFor(selectedDate);
                  }}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <Input
              placeholder="Any notes for the group..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        {/* WODs */}
        {wods.map((wod, wodIndex) => (
          <AnimatedWODSection
            key={wod.id}
            removing={wod.removing}
            onRemoveComplete={() => handleWodRemoveComplete(wod.id)}
          >
            <View style={styles.wodSection}>
              <View style={styles.wodHeader}>
                <Text style={[styles.wodTitle, Typography.headingMedium]}>
                  WOD {wodIndex + 1}
                </Text>
                {wods.filter((w) => !w.removing).length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveWod(wod.id)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, Typography.bodyMedium]}>WOD Name</Text>
                <Input
                  placeholder='e.g., "WOD1" or "Fran"'
                  value={wod.name}
                  onChangeText={(text) => handleWodNameChange(wod.id, text)}
                />
              </View>

              <View style={styles.exercisesContainer}>
                <Text style={[styles.sectionTitle, Typography.headingSmall]}>Exercises</Text>

                {wod.exercises.map((exercise, exerciseIndex) => (
                  <AnimatedExerciseSection
                    key={exercise.id}
                    removing={exercise.removing}
                    onRemoveComplete={() => handleExerciseRemoveComplete(wod.id, exercise.id)}
                  >
                    <View style={styles.exerciseSection}>
                      <View style={styles.exerciseHeader}>
                        <Text style={[styles.exerciseLabel, Typography.bodyMedium]}>
                          Exercise {exerciseIndex + 1}
                        </Text>
                        {wod.exercises.filter((ex) => !ex.removing).length > 1 && (
                          <TouchableOpacity
                            onPress={() => handleRemoveExercise(wod.id, exercise.id)}
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
                          onSelectExercise={(sel) => handleExerciseSelect(wod.id, exercise.id, sel)}
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
                        <Text style={styles.inputLabel}>Instructions</Text>
                        <Input
                          placeholder="e.g., 21-15-9 reps"
                          value={exercise.instructions}
                          onChangeText={(text) => handleExerciseChange(wod.id, exercise.id, "instructions", text)}
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

                <TouchableOpacity style={styles.addButton} onPress={() => handleAddExercise(wod.id)}>
                  <Text style={styles.addButtonText}>+ Add Exercise</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedWODSection>
        ))}

        <TouchableOpacity style={styles.addWodButton} onPress={handleAddWod}>
          <Text style={styles.addWodButtonText}>+ Add WOD</Text>
        </TouchableOpacity>
      </View>
    </Page>
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
  sectionTitle: { color: Colors.text.primary, marginBottom: 12, fontWeight: "600" } as TextStyle,
  label: { color: Colors.text.primary, marginBottom: 8, fontWeight: "600" } as TextStyle,
  section: { marginBottom: 16 } as ViewStyle,
  inputGroup: { marginBottom: 12 } as ViewStyle,
  inputLabel: { color: Colors.text.secondary, fontSize: responsiveSize(12), marginBottom: 4, fontWeight: "500" } as TextStyle,
  wodSection: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 16, marginBottom: 16 } as ViewStyle,
  wodHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } as ViewStyle,
  wodTitle: { color: Colors.text.primary, fontWeight: "600" } as TextStyle,
  removeButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.error[500], borderRadius: 6 } as ViewStyle,
  removeButtonText: { color: "#fff", fontSize: responsiveSize(12), fontWeight: "600" } as TextStyle,
  exercisesContainer: { marginTop: 8 } as ViewStyle,
  exerciseSection: { backgroundColor: Colors.background.primary, borderRadius: 8, padding: 12, marginBottom: 12 } as ViewStyle,
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } as ViewStyle,
  exerciseLabel: { color: Colors.text.primary, fontWeight: "600" } as TextStyle,
  removeExerciseButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.error[500], justifyContent: "center", alignItems: "center" } as ViewStyle,
  removeExerciseText: { color: "#fff", fontSize: responsiveSize(18), fontWeight: "bold", lineHeight: responsiveSize(20) } as TextStyle,
  exerciseErrorText: { fontSize: responsiveSize(11), color: Colors.error[500], marginTop: 4, fontWeight: "500" } as TextStyle,
  addButton: { backgroundColor: Colors.background.primary, borderRadius: 8, padding: 12, alignItems: "center", borderWidth: 1, borderColor: Colors.primary[500], borderStyle: "dashed" } as ViewStyle,
  addButtonText: { color: Colors.primary[500], fontSize: responsiveSize(14), fontWeight: "600" } as TextStyle,
  addWodButton: { backgroundColor: Colors.primary[500], borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 16 } as ViewStyle,
  addWodButtonText: { color: "#fff", fontSize: responsiveSize(16), fontWeight: "700" } as TextStyle,
  trackingTypeDisplay: { backgroundColor: Colors.background.secondary, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.primary[500], alignSelf: "flex-start" } as ViewStyle,
  trackingTypeDisplayText: { fontSize: responsiveSize(12), fontWeight: "600", color: Colors.primary[500], textTransform: "capitalize" } as TextStyle,
  dateButton: { backgroundColor: Colors.background.primary, borderRadius: 8, borderWidth: 1, borderColor: Colors.text.tertiary, paddingHorizontal: 16, paddingVertical: 12 } as ViewStyle,
  dateText: { color: Colors.text.primary, fontSize: responsiveSize(16) } as TextStyle,
  doneButton: { backgroundColor: Colors.primary[500], borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24, alignItems: "center", marginTop: 8 } as ViewStyle,
  doneButtonText: { color: "#fff", fontSize: responsiveSize(16), fontWeight: "600" } as TextStyle,
});
