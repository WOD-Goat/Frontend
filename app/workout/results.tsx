import { authService, groupsService, workoutsService } from "@/api/services";
import { BottomSheetSelect, Button, ExerciseSearchInput, Gap, Input, Page } from "@/components";
import { storage, useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import standardExercises from "@/constants/standardExercises.json";
import type { ExerciseData, ResultData, StandardExercise, TrackingType, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ResultEntry {
  id: string;
  // structured mode
  wodIndex: number;
  exerciseIndex: number;
  // raw mode
  exerciseName: string;
  exerciseId: string;
  trackingType: TrackingType | "";
  // inputs
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

const blankEntry = (id: string): ResultEntry => ({
  id,
  wodIndex: 0,
  exerciseIndex: 0,
  exerciseName: "",
  exerciseId: "",
  trackingType: "",
  reps: "",
  weight: "",
  timeMins: "",
  timeSecs: "",
  distanceKm: "",
  calories: "",
});

export default function PRsScreen() {
  const params = useLocalSearchParams<{
    workoutData: string;
    type?: string;
    workoutId?: string;
    groupId?: string;
  }>();

  const type = params.type ?? "personal";
  const parsed = JSON.parse(params.workoutData);
  const isRaw = parsed.wodType === "raw";
  const wods: WODData[] = parsed.wods ?? [];
  const resolvedWorkoutId: string =
    type === "group" ? (params.workoutId ?? "") : (parsed.id ?? "");
  const groupId = params.groupId ?? "";

  const [results, setResults] = useState<ResultEntry[]>([blankEntry("result-1")]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const commentCardY = useRef(0);

  const globalState = useGlobalState();
  const { showToast } = useToast();

  // ── structured helpers ──────────────────────────────────────────────────────

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

  const hasAvailableStructuredExercises = () => {
    const total = wods.reduce(
      (s, w) => s + w.exercises.filter(isTrackable).length,
      0,
    );
    return results.length < total;
  };

  // ── update helpers ──────────────────────────────────────────────────────────

  const updateResult = (id: string, field: keyof ResultEntry, value: string | number) => {
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

  const handleSelectRawExercise = (id: string, exercise: StandardExercise) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, exerciseName: exercise.name, exerciseId: exercise.id, trackingType: exercise.trackingType }
          : r,
      ),
    );
  };

  const addResultEntry = () => {
    if (!isRaw) {
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
        { ...blankEntry(`result-${Date.now()}`), wodIndex: newWodIndex, exerciseIndex: newExerciseIndex },
      ]);
    } else {
      setResults((prev) => [...prev, blankEntry(`result-${Date.now()}`)]);
    }
  };

  const removeResultEntry = (id: string) => {
    if (results.length === 1) return;
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  // ── format & submit ─────────────────────────────────────────────────────────

  const formatResults = (): ResultData[] =>
    results
      .filter((r) => (isRaw ? r.exerciseName.trim() !== "" : true))
      .map((r, index) => {
        const totalSeconds =
          parseInt(r.timeMins || "0") * 60 + parseInt(r.timeSecs || "0");
        const meters = r.distanceKm
          ? Math.round(parseFloat(r.distanceKm) * 1000)
          : null;
        return {
          wodIndex: isRaw ? 0 : r.wodIndex,
          exerciseIndex: isRaw ? index : r.exerciseIndex,
          exerciseName: isRaw
            ? r.exerciseName
            : (getExercise(r.wodIndex, r.exerciseIndex)?.name ?? undefined),
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
    const trimmedComment = comment.trim() || null;
    try {
      setSubmitting(true);
      if (type === "group") {
        await groupsService.submitGroupWorkout(groupId, resolvedWorkoutId, [], trimmedComment);
      } else {
        await workoutsService.completeWorkout(resolvedWorkoutId, [], trimmedComment);
        await refreshProfile();
      }
      navigateHome();
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to complete workout" });
    } finally {
      setSubmitting(false);
    }
  };

  const hasAnyInput = () => {
    if (isRaw) {
      return results.some(
        (r) =>
          r.exerciseName.trim() !== "" &&
          (r.reps || r.weight || r.timeMins || r.timeSecs || r.distanceKm || r.calories),
      );
    }
    return results.some(
      (r) => r.reps || r.weight || r.timeMins || r.timeSecs || r.distanceKm || r.calories,
    );
  };

  const handleSave = async () => {
    if (!hasAnyInput()) {
      handleSkip();
      return;
    }
    const trimmedComment = comment.trim() || null;
    try {
      setSubmitting(true);
      const formattedResults = formatResults();
      let response;
      if (type === "group") {
        response = await groupsService.submitGroupWorkout(
          groupId,
          resolvedWorkoutId,
          formattedResults,
          trimmedComment,
        );
      } else {
        response = await workoutsService.completeWorkout(
          resolvedWorkoutId,
          formattedResults,
          trimmedComment,
        );
        if (response.success) await refreshProfile();
      }
      if (response.success) {
        showToast({ type: "success", label: "PRs saved!" });
        navigateHome();
      } else {
        showToast({ type: "error", label: (response as any).message || "Failed to save" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to save PRs" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── input fields ────────────────────────────────────────────────────────────

  const renderInputFields = (result: ResultEntry) => {
    const trackingType = isRaw
      ? result.trackingType
      : getExercise(result.wodIndex, result.exerciseIndex)?.trackingType;

    if (!trackingType) return null;

    switch (trackingType) {
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
      scrollRef={scrollRef}
      headerRight={
        <TouchableOpacity onPress={handleSkip} disabled={submitting} style={styles.skipLink}>
          <Text style={styles.skipLinkText}>Skip</Text>
        </TouchableOpacity>
      }
      footer={
        <View style={styles.footerRow}>
          <View style={{ flex: 1 }}>
            <Button
              title="No PRs today"
              variant="secondary"
              size="large"
              onPress={handleSkip}
              disabled={submitting}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={submitting ? "Saving..." : "Save PRs"}
              variant="primary"
              size="large"
              onPress={handleSave}
              disabled={submitting}
            />
          </View>
        </View>
      }
    >
      {/* Header */}
      <View style={styles.celebrationBox}>
        <View style={styles.medalCircle}>
          <Ionicons name="medal" size={36} color={Colors.primary[500]} />
        </View>
        <Gap size={16} />
        <Text style={styles.celebrationTitle}>Workout Complete!</Text>
        <Gap size={8} />
        <Text style={styles.celebrationSubtitle}>
          Did you break any personal records?{"\n"}Log them below or skip.
        </Text>
      </View>

      <Gap size={24} />

      {/* PR entries */}
      {results.map((result, index) => (
        <View key={result.id} style={styles.resultCard}>
          <View style={styles.resultCardHeader}>
            <View style={styles.prBadge}>
              <Ionicons name="medal-outline" size={14} color={Colors.primary[500]} />
              <Text style={styles.prBadgeText}>PR #{index + 1}</Text>
            </View>
            {results.length > 1 && (
              <TouchableOpacity onPress={() => removeResultEntry(result.id)}>
                <Ionicons name="trash-outline" size={18} color={Colors.error[500]} />
              </TouchableOpacity>
            )}
          </View>

          {isRaw ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Exercise</Text>
                <ExerciseSearchInput
                  value={result.exerciseName}
                  onSelectExercise={(ex) => handleSelectRawExercise(result.id, ex)}
                  placeholder="Search for an exercise"
                />
              </View>
              {result.trackingType ? renderInputFields(result) : null}
            </>
          ) : (
            <>
              {wods.length > 1 && (
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
              )}
              <BottomSheetSelect
                label="Exercise"
                placeholder="Select Exercise"
                value={result.exerciseIndex}
                options={getAvailableExercises(result.id, result.wodIndex)}
                onValueChange={(v) => updateResult(result.id, "exerciseIndex", v)}
              />
              {renderInputFields(result)}
            </>
          )}
        </View>
      ))}

      {(isRaw || hasAvailableStructuredExercises()) && (
        <TouchableOpacity style={styles.addResultBtn} onPress={addResultEntry}>
          <Ionicons name="add-circle" size={20} color={Colors.primary[500]} />
          <Text style={styles.addResultBtnText}>Add Another PR</Text>
        </TouchableOpacity>
      )}

      <Gap size={16} />

      {/* Workout comment */}
      <View
        style={styles.commentCard}
        onLayout={(e) => { commentCardY.current = e.nativeEvent.layout.y; }}
      >
        <View style={styles.commentHeader}>
          <Ionicons name="chatbubble-outline" size={15} color={Colors.text.secondary} />
          <Text style={styles.commentLabel}>How did it go? (optional)</Text>
        </View>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Felt strong today, hit a new squat PR…"
          placeholderTextColor={Colors.text.secondary}
          multiline
          maxLength={500}
          textAlignVertical="top"
          onFocus={() => {
            setTimeout(() => {
              scrollRef.current?.scrollTo({ y: commentCardY.current - 20, animated: true });
            }, 150);
          }}
        />
        <Text style={styles.commentCount}>{comment.length}/500</Text>
      </View>

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
  medalCircle: {
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
  skipLink: { padding: 4 },
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
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primary[500] + "18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  prBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(12),
    color: Colors.primary[500],
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
  commentCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  commentLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.tertiary,
  },
  commentInput: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    minHeight: 96,
    padding: 0,
  },
  commentCount: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.tertiary,
    textAlign: "right",
    marginTop: 8,
  },
});
