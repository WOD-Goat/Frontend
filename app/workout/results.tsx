import { authService, groupsService, workoutsService } from "@/api/services";
import { BottomSheetSelect, Button, Gap, Input, Page } from "@/components";
import { storage, useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import standardExercises from "@/constants/standardExercises.json";
import type { ExerciseData, ResultData, StandardExercise, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
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

const exerciseMap = new Map(
  (standardExercises as StandardExercise[]).map((e) => [e.id, e]),
);

const isTrackable = (exercise: ExerciseData) =>
  exerciseMap.get(exercise.exerciseId)?.trackResults !== false;

export default function PostWorkoutScreen() {
  const params = useLocalSearchParams<{
    workoutData: string;
    type?: string;
    workoutId?: string;
    groupId?: string;
  }>();

  const type = params.type ?? "personal";
  const parsed = JSON.parse(params.workoutData);
  const wods: WODData[] = parsed.wods;
  const resolvedWorkoutId: string =
    type === "group" ? (params.workoutId ?? "") : (parsed.id ?? "");
  const groupId = params.groupId ?? "";

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

  const getExercise = (wodIndex: number, exerciseIndex: number) =>
    wods[wodIndex]?.exercises[exerciseIndex];

  const getAvailableExercises = (currentId: string, wodIndex: number) => {
    const wod = wods[wodIndex];
    if (!wod) return [];
    const selected = results
      .filter((r) => r.id !== currentId && r.wodIndex === wodIndex)
      .map((r) => r.exerciseIndex);
    return wod.exercises
      .map((ex, idx) => ({ ex, idx }))
      .filter(({ ex, idx }) => !selected.includes(idx) && isTrackable(ex))
      .map(({ ex, idx }) => ({ label: ex.name, value: idx }));
  };

  const hasAvailableExercises = () => {
    const total = wods.reduce(
      (s, w) => s + w.exercises.filter(isTrackable).length,
      0,
    );
    return results.length < total;
  };

  const updateResult = (
    id: string,
    field: keyof ResultEntry,
    value: string | number,
  ) => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "wodIndex") {
          const newWodIndex = value as number;
          const selected = prev
            .filter((res) => res.id !== id && res.wodIndex === newWodIndex)
            .map((res) => res.exerciseIndex);
          const first = (wods[newWodIndex]?.exercises ?? []).findIndex(
            (_, idx) => !selected.includes(idx),
          );
          return { ...r, wodIndex: newWodIndex, exerciseIndex: first !== -1 ? first : 0 };
        }
        return { ...r, [field]: field === "exerciseIndex" ? value : value.toString() };
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
    setResults((prev) => [
      ...prev,
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
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const formatResults = (): ResultData[] =>
    results.map((r) => {
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

  const navigateHome = () => {
    router.dismissAll();
    router.replace(type === "group" ? "/(tabs)/groups" : "/(tabs)");
  };

  const refreshProfile = async () => {
    const res = await authService.getProfile();
    await storage.set("user", res.user);
    globalState.set("user", res.user);
  };

  const handleSkip = async () => {
    try {
      setSubmitting(true);
      if (type === "group") {
        await groupsService.submitGroupWorkout(groupId, resolvedWorkoutId, []);
      } else {
        await workoutsService.completeWorkout(resolvedWorkoutId, []);
        await refreshProfile();
      }
      navigateHome();
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to complete workout" });
    } finally {
      setSubmitting(false);
    }
  };

  const hasAnyInput = () =>
    results.some(
      (r) =>
        r.reps || r.weight || r.timeMins || r.timeSecs || r.distanceKm || r.calories,
    );

  const handleSave = async () => {
    if (!hasAnyInput()) {
      handleSkip();
      return;
    }
    try {
      setSubmitting(true);
      const formattedResults = formatResults();
      let response;
      if (type === "group") {
        response = await groupsService.submitGroupWorkout(
          groupId,
          resolvedWorkoutId,
          formattedResults,
        );
      } else {
        response = await workoutsService.completeWorkout(
          resolvedWorkoutId,
          formattedResults,
        );
        if (response.success) await refreshProfile();
      }
      if (response.success) {
        showToast({ type: "success", label: "Results saved!" });
        navigateHome();
      } else {
        showToast({ type: "error", label: (response as any).message || "Failed to save" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to save results" });
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
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <Input placeholder="0" value={result.weight} onChangeText={(t) => updateResult(result.id, "weight", t)} keyboardType="numeric" />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Reps</Text>
              <Input placeholder="0" value={result.reps} onChangeText={(t) => updateResult(result.id, "reps", t)} keyboardType="numeric" />
            </View>
          </View>
        );
      case "reps":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <Input placeholder="0" value={result.reps} onChangeText={(t) => updateResult(result.id, "reps", t)} keyboardType="numeric" />
          </View>
        );
      case "time":
        return (
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Minutes</Text>
              <Input placeholder="0" value={result.timeMins} onChangeText={(t) => updateResult(result.id, "timeMins", t)} keyboardType="numeric" />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Seconds</Text>
              <Input placeholder="0" value={result.timeSecs} onChangeText={(t) => updateResult(result.id, "timeSecs", t)} keyboardType="numeric" />
            </View>
          </View>
        );
      case "distance":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Distance (km)</Text>
            <Input placeholder="0.0" value={result.distanceKm} onChangeText={(t) => updateResult(result.id, "distanceKm", t)} keyboardType="decimal-pad" />
          </View>
        );
      case "pace":
        return (
          <>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Minutes</Text>
                <Input placeholder="0" value={result.timeMins} onChangeText={(t) => updateResult(result.id, "timeMins", t)} keyboardType="numeric" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Seconds</Text>
                <Input placeholder="0" value={result.timeSecs} onChangeText={(t) => updateResult(result.id, "timeSecs", t)} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Distance (km)</Text>
              <Input placeholder="0.0" value={result.distanceKm} onChangeText={(t) => updateResult(result.id, "distanceKm", t)} keyboardType="decimal-pad" />
            </View>
          </>
        );
      case "calories":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Calories</Text>
            <Input placeholder="0" value={result.calories} onChangeText={(t) => updateResult(result.id, "calories", t)} keyboardType="numeric" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Page
      title=""
      showBackButton={false}
      scrollable={true}
      headerRight={
        <TouchableOpacity onPress={handleSkip} disabled={submitting} style={styles.skipLink}>
          <Text style={styles.skipLinkText}>Skip</Text>
        </TouchableOpacity>
      }
      footer={
        <View style={styles.footerRow}>
          <View style={{ flex: 1 }}>
            <Button
              title="Skip for now"
              variant="secondary"
              size="large"
              onPress={handleSkip}
              disabled={submitting}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={submitting ? "Saving..." : "Save Results"}
              variant="primary"
              size="large"
              onPress={handleSave}
              disabled={submitting}
            />
          </View>
        </View>
      }
    >
      {/* Celebration header */}
      <View style={styles.celebrationBox}>
        <View style={styles.trophyCircle}>
          <Ionicons name="trophy" size={36} color={Colors.primary[500]} />
        </View>
        <Gap size={16} />
        <Text style={styles.celebrationTitle}>Workout Complete!</Text>
        <Gap size={8} />
        <Text style={styles.celebrationSubtitle}>
          Hit any new PRs or want to log your results?{"\n"}
          Totally optional — skip whenever you're done.
        </Text>
      </View>

      <Gap size={24} />

      {/* Result entries */}
      {results.map((result, index) => (
        <View key={result.id} style={styles.resultCard}>
          <View style={styles.resultCardHeader}>
            <Text style={styles.resultCardTitle}>Result {index + 1}</Text>
            {results.length > 1 && (
              <TouchableOpacity onPress={() => removeResultEntry(result.id)}>
                <Ionicons name="trash-outline" size={18} color={Colors.error[500]} />
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

      <Gap size={24} />
    </Page>
  );
}

const styles = StyleSheet.create({
  celebrationBox: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 28,
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "30",
    marginTop: 8,
  },
  trophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary[500] + "18",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary[500] + "40",
  },
  celebrationTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    textAlign: "center",
  },
  celebrationSubtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  skipLink: {
    padding: 4,
  },
  skipLinkText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
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
  footerRow: {
    flexDirection: "row",
    gap: 12,
  },
});
