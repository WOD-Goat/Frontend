import { groupsService } from "@/api/services";
import { BottomSheetSelect, Button, Gap, Input, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
import type { GroupWorkout, ResultData, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

function LogResultsPanel({
  wods,
  groupId,
  workoutId,
  onSubmitSuccess,
}: {
  wods: WODData[];
  groupId: string;
  workoutId: string;
  onSubmitSuccess: () => void;
}) {
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
  const { showToast } = useToast();

  const getExercise = (wodIndex: number, exerciseIndex: number) =>
    wods[wodIndex]?.exercises[exerciseIndex];

  const getAvailableExercises = (currentId: string, wodIndex: number) => {
    const wod = wods[wodIndex];
    if (!wod) return [];
    const selected = results
      .filter((r) => r.id !== currentId && r.wodIndex === wodIndex)
      .map((r) => r.exerciseIndex);
    return wod.exercises
      .map((ex, idx) => ({ label: ex.name, value: idx }))
      .filter(({ value }) => !selected.includes(value));
  };

  const hasAvailableExercises = () => {
    const total = wods.reduce((s, w) => s + w.exercises.length, 0);
    return results.length < total;
  };

  const updateResult = (
    id: string,
    field: keyof ResultEntry,
    value: string | number,
  ) => {
    setResults(
      results.map((r) => {
        if (r.id !== id) return r;
        if (field === "wodIndex") {
          const newWodIndex = value as number;
          const selected = results
            .filter((res) => res.id !== id && res.wodIndex === newWodIndex)
            .map((res) => res.exerciseIndex);
          const first = (wods[newWodIndex]?.exercises || []).findIndex(
            (_, idx) => !selected.includes(idx),
          );
          return {
            ...r,
            wodIndex: newWodIndex,
            exerciseIndex: first !== -1 ? first : 0,
          };
        }
        return {
          ...r,
          [field]: field === "exerciseIndex" ? value : value.toString(),
        };
      }),
    );
  };

  const addResultEntry = () => {
    const selected = results.map((r) => `${r.wodIndex}-${r.exerciseIndex}`);
    let newWodIndex = 0;
    let newExerciseIndex = 0;
    outer: for (let w = 0; w < wods.length; w++) {
      for (let e = 0; e < wods[w].exercises.length; e++) {
        if (!selected.includes(`${w}-${e}`)) {
          newWodIndex = w;
          newExerciseIndex = e;
          break outer;
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
    if (results.length === 1) return;
    setResults(results.filter((r) => r.id !== id));
  };

  const renderInputFields = (result: ResultEntry) => {
    const exercise = getExercise(result.wodIndex, result.exerciseIndex);
    if (!exercise) return null;
    switch (exercise.trackingType) {
      case "weight_reps":
        return (
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Weight (KG)</Text>
              <Input
                placeholder="0"
                value={result.weight}
                onChangeText={(t) => updateResult(result.id, "weight", t)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Reps</Text>
              <Input
                placeholder="0"
                value={result.reps}
                onChangeText={(t) => updateResult(result.id, "reps", t)}
                keyboardType="numeric"
              />
            </View>
          </View>
        );
      case "reps":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <Input
              placeholder="0"
              value={result.reps}
              onChangeText={(t) => updateResult(result.id, "reps", t)}
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
                onChangeText={(t) => updateResult(result.id, "timeMins", t)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Seconds</Text>
              <Input
                placeholder="0"
                value={result.timeSecs}
                onChangeText={(t) => updateResult(result.id, "timeSecs", t)}
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
              onChangeText={(t) => updateResult(result.id, "distanceKm", t)}
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
                  onChangeText={(t) => updateResult(result.id, "timeMins", t)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Seconds</Text>
                <Input
                  placeholder="0"
                  value={result.timeSecs}
                  onChangeText={(t) => updateResult(result.id, "timeSecs", t)}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Distance (km)</Text>
              <Input
                placeholder="0.0"
                value={result.distanceKm}
                onChangeText={(t) => updateResult(result.id, "distanceKm", t)}
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
              onChangeText={(t) => updateResult(result.id, "calories", t)}
              keyboardType="numeric"
            />
          </View>
        );
      default:
        return null;
    }
  };

  const validateResults = (): string | null => {
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const exercise = getExercise(r.wodIndex, r.exerciseIndex);
      if (!exercise) continue;
      const label = `Result ${i + 1}`;
      switch (exercise.trackingType) {
        case "weight_reps":
          if (!r.weight.trim() || !r.reps.trim())
            return `${label}: weight and reps are required`;
          break;
        case "reps":
          if (!r.reps.trim()) return `${label}: reps are required`;
          break;
        case "time":
          if (!r.timeMins.trim() && !r.timeSecs.trim())
            return `${label}: time is required`;
          break;
        case "distance":
          if (!r.distanceKm.trim()) return `${label}: distance is required`;
          break;
        case "pace":
          if (!r.distanceKm.trim()) return `${label}: distance is required`;
          if (!r.timeMins.trim() && !r.timeSecs.trim())
            return `${label}: time is required`;
          break;
        case "calories":
          if (!r.calories.trim()) return `${label}: calories are required`;
          break;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateResults();
    if (error) {
      showToast({ type: "error", label: error });
      return;
    }
    try {
      setSubmitting(true);
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

      const response = await groupsService.submitGroupWorkout(
        groupId,
        workoutId,
        formattedResults,
      );
      if (response.success) {
        showToast({ type: "success", label: "Results submitted!" });
        onSubmitSuccess();
      } else {
        showToast({
          type: "error",
          label: response.message || "Failed to submit results",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        label: err.message || "Failed to submit results",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <Text style={styles.panelTitle}>Log Your Results</Text>
      <Gap size={12} />
      {results.map((result, index) => (
        <View key={result.id} style={styles.resultCard}>
          <View style={styles.resultCardHeader}>
            <Text style={styles.resultCardTitle}>Result {index + 1}</Text>
            {results.length > 1 && (
              <TouchableOpacity onPress={() => removeResultEntry(result.id)}>
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={Colors.error[500]}
                />
              </TouchableOpacity>
            )}
          </View>
          <BottomSheetSelect
            label="WOD"
            placeholder="Select WOD"
            value={result.wodIndex}
            options={wods.map((wod, idx) => ({
              label: wod.name || `WOD ${idx + 1}`,
              value: idx,
            }))}
            onValueChange={(v) => updateResult(result.id, "wodIndex", v)}
          />
          <BottomSheetSelect
            label="Exercise"
            placeholder="Select Exercise"
            value={result.exerciseIndex}
            options={getAvailableExercises(result.id, result.wodIndex)}
            onValueChange={(v) => updateResult(result.id, "exerciseIndex", v)}
          />
          {renderInputFields(result)}
        </View>
      ))}

      {hasAvailableExercises() && (
        <TouchableOpacity style={styles.addResultBtn} onPress={addResultEntry}>
          <Ionicons name="add-circle" size={20} color={Colors.primary[500]} />
          <Text style={styles.addResultBtnText}>Add Another Result</Text>
        </TouchableOpacity>
      )}

      <Gap size={12} />
      <Button
        title={submitting ? "Submitting..." : "Submit Results"}
        variant="primary"
        size="large"
        fullWidth
        disabled={submitting}
        onPress={handleSubmit}
      />
    </View>
  );
}

export default function GroupWorkoutDetailScreen() {
  const { workoutId, groupId } = useLocalSearchParams<{
    workoutId: string;
    groupId: string;
  }>();
  const [workout, setWorkout] = useState<GroupWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showLogResults, setShowLogResults] = useState(false);
  const { showToast } = useToast();
  const globalState = useGlobalState();
  const { guard } = useFeatureGuard();

  useEffect(() => {
    if (workoutId && groupId) loadWorkout();
  }, [workoutId, groupId]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const response = await groupsService.getGroupWorkout(groupId, workoutId);
      if (response.success && response.data) {
        setWorkout(response.data);
        setSubmitted(response.data.hasSubmitted ?? false);
      } else {
        showToast({
          type: "error",
          label: response.message || "Workout not found",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        label: err.message || "Failed to load workout",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Page showBackButton={true} title="Group Workout">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </Page>
    );
  }

  if (!workout) {
    return (
      <Page showBackButton={true} title="Group Workout">
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors.error[500]}
          />
          <Gap size={16} />
          <Text style={styles.errorText}>Workout not found</Text>
        </View>
      </Page>
    );
  }

  const scheduledDate = new Date(workout.scheduledFor);
  const currentUserId = globalState.get("user")?.uid ?? "";
  const isAdmin = workout.createdBy === currentUserId;

  const footer = !submitted && !showLogResults ? (
    <TouchableOpacity
      style={styles.footerButton}
      activeOpacity={0.85}
      onPress={() => setShowLogResults(true)}
    >
      <Ionicons name="barbell-outline" size={18} color="#fff" />
      <Text style={styles.footerButtonText}>Log Results</Text>
    </TouchableOpacity>
  ) : null;

  const headerRight = isAdmin ? (
    <TouchableOpacity
      onPress={() =>
        guard("leaderboard", () =>
          router.push(
            `/group/workout/leaderboard?groupId=${groupId}&workoutId=${workoutId}`,
          ),
        )
      }
      style={styles.headerIconBtn}
    >
      <Ionicons name="trophy-outline" size={22} color={Colors.primary[500]} />
    </TouchableOpacity>
  ) : null;

  return (
    <Page
      showBackButton={true}
      title={workout.title || "Group Workout"}
      scrollable={true}
      footer={footer}
      headerRight={headerRight}
    >
      {/* Workout header */}
      <View style={styles.workoutHeader}>
        <View style={styles.workoutHeaderTop}>
          <View style={styles.groupBadge}>
            <Ionicons name="people" size={12} color={Colors.primary[500]} />
            <Text style={styles.groupBadgeText}>Group Workout</Text>
          </View>
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

      <Gap size={20} />

      {/* Results */}
      {showLogResults &&  (
        <LogResultsPanel
          wods={workout.wods}
          groupId={groupId}
          workoutId={workoutId}
          onSubmitSuccess={() => {
            setSubmitted(true);
            router.dismissAll();
            router.replace("/(tabs)");
          }}
        />
      )}

      <Gap size={24} />
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
  workoutHeaderTop: { flexDirection: "row", alignItems: "center" },
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
  panelTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  resultCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  resultCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultCardTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  inputHalf: { flex: 1 },
  addResultBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderStyle: "dashed",
    marginBottom: 8,
  },
  addResultBtnText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  headerIconBtn: {
    padding: 4,
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
  submittedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.success[500] + "15",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.success[500] + "40",
  },
  submittedBannerText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.success[500],
  },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
  },
});
