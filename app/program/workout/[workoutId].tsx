import { programsService } from "@/api/services";
import { tabIcons } from "@/assets/images";
import { Gap, Page } from "@/components";
import { MiniTimer } from "@/components/timer/MiniTimer";
import { TimerSetupSheet } from "@/components/timer/TimerSetupSheet";
import { WorkoutTimerOverlay } from "@/components/timer/WorkoutTimerOverlay";
import type { TimerWOD } from "@/components/timer/WorkoutTimerOverlay";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { audioService } from "@/lib/timer/services/AudioService";
import type { WODConfig } from "@/lib/timer/types";
import { useTimerStore } from "@/lib/timer/viewmodels/timerStore";
import type { ProgramWorkout, ResultData, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  LayoutAnimation,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Exercise {
  name: string;
  instructions?: string[];
  exerciseId?: string;
  trackingType?: string;
}

interface WOD {
  id: string;
  title: string;
  exercises: Exercise[];
  rawText?: string;
  completed: boolean;
}

function ExerciseCard({
  wod,
  wodIndex,
  isExpanded,
  isCompleted,
  hideMarkComplete,
  onToggle,
  onMarkComplete,
  onOpenTimer,
}: {
  wod: WODData;
  wodIndex: number;
  isExpanded: boolean;
  isCompleted: boolean;
  hideMarkComplete?: boolean;
  onToggle: () => void;
  onMarkComplete: () => void;
  onOpenTimer?: () => void;
}) {
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, { toValue: isExpanded ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  }, [isExpanded]);

  const chevronRotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const accentColor = isCompleted ? Colors.success[500] : Colors.primary[500];

  return (
    <View style={styles.wodCardWrapper}>
      <View style={[styles.wodCard, { borderLeftColor: accentColor }, isCompleted && styles.wodCardCompleted]}>
        {!hideMarkComplete && (
          <TouchableOpacity
            style={[styles.markCompleteRow, isCompleted && styles.markCompleteRowDone]}
            onPress={onMarkComplete}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={17}
              color={isCompleted ? Colors.success[500] : Colors.text.secondary}
            />
            <Text style={[styles.markCompleteText, isCompleted && styles.markCompleteTextDone]}>
              {isCompleted ? "Completed" : "Mark as Completed"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.wodCardHeader, !hideMarkComplete && { borderTopColor: Colors.neutral[700] }]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Text style={[styles.wodCardTitle, isCompleted && { color: Colors.success[500] }]}>
            {wod.name || `WOD ${wodIndex + 1}`}
          </Text>
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <Ionicons name="chevron-down" size={20} color={isCompleted ? Colors.success[500] : Colors.text.secondary} />
          </Animated.View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.wodCardContent}>
            {wod.rawText ? (
              <Text style={styles.wodRawText}>{wod.rawText}</Text>
            ) : (
              wod.exercises.map((ex, i) => (
                <View key={i} style={[styles.exerciseRow, i < wod.exercises.length - 1 && styles.exerciseRowBorder]}>
                  <View style={[styles.exerciseNumBadge, { backgroundColor: accentColor + "20" }]}>
                    <Text style={[styles.exerciseNumText, { color: accentColor }]}>
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    {ex.instructions ? <Text style={styles.exerciseInstructions}>{ex.instructions}</Text> : null}
                    <View style={[styles.trackingBadge, { backgroundColor: accentColor + "18" }]}>
                      <Text style={[styles.trackingBadgeText, { color: accentColor }]}>
                        {ex.trackingType?.replace("_", " ")}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {!hideMarkComplete && onOpenTimer && (
        <TouchableOpacity style={styles.timerCornerBtn} onPress={onOpenTimer} activeOpacity={0.85} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image source={tabIcons.timer} style={styles.timerCornerIcon} resizeMode="contain" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const formatResultValue = (r: ResultData): string => {
  if (r.weight != null && r.reps != null) return `${r.weight} kg × ${r.reps} reps`;
  const parts: string[] = [];
  if (r.weight != null) parts.push(`${r.weight} kg`);
  if (r.reps != null) parts.push(`${r.reps} reps`);
  if (r.timeInSeconds != null) {
    const m = Math.floor(r.timeInSeconds / 60);
    const s = r.timeInSeconds % 60;
    parts.push(m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`);
  }
  if (r.distanceMeters != null) parts.push(`${r.distanceMeters} m`);
  if (r.calories != null) parts.push(`${r.calories} cal`);
  return parts.join(" · ") || "—";
};

export default function ProgramWorkoutDetailScreen() {
  const { workoutId, programId } = useLocalSearchParams<{ workoutId: string; programId: string }>();
  const navigation = useNavigation();
  const [workout, setWorkout] = useState<ProgramWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [wods, setWods] = useState<WOD[]>([]);
  const [expandedWods, setExpandedWods] = useState<Record<number, boolean>>({});
  const { showToast } = useToast();

  const [timerSetupVisible, setTimerSetupVisible] = useState(false);
  const [timerOverlayVisible, setTimerOverlayVisible] = useState(false);
  const [timerMinimized, setTimerMinimized] = useState(false);
  const [activeTimerWod, setActiveTimerWod] = useState<TimerWOD | null>(null);
  const timerIsRunning = useTimerStore((s) => s.isRunning);
  const timerHasStarted = useTimerStore((s) => s.hasStarted);
  const timerIsComplete = useTimerStore((s) => s.isComplete);
  const timerConfigure = useTimerStore((s) => s.configure);
  const timerStart = useTimerStore((s) => s.start);
  const timerStop = useTimerStore((s) => s.stop);
  const timerReset = useTimerStore((s) => s.reset);
  const timerPause = useTimerStore((s) => s.pause);
  const timerResume = useTimerStore((s) => s.resume);

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !timerOverlayVisible });
  }, [timerOverlayVisible, navigation]);

  const handleOpenTimerSetup = useCallback(
    (wod: WOD) => {
      const timerWod: TimerWOD = { id: wod.id, title: wod.title, exercises: wod.exercises, rawText: wod.rawText, completed: wod.completed };
      if ((timerIsRunning || timerHasStarted) && !timerIsComplete) {
        timerStop();
      }
      setActiveTimerWod(timerWod);
      setTimerSetupVisible(true);
    },
    [timerIsRunning, timerHasStarted, timerIsComplete, timerStop],
  );

  const handleTimerStart = useCallback(
    async (config: WODConfig) => {
      await audioService.init();
      timerConfigure(config);
      timerStart();
      setTimerSetupVisible(false);
      setTimerOverlayVisible(true);
      setTimerMinimized(false);
    },
    [timerConfigure, timerStart],
  );

  const handleTimerStop = useCallback(() => {
    timerStop();
    timerReset();
    setTimerOverlayVisible(false);
    setTimerMinimized(false);
    setActiveTimerWod(null);
  }, [timerStop, timerReset]);

  const handleMinimize = useCallback(() => {
    setTimerOverlayVisible(false);
    setTimerMinimized(true);
  }, []);

  const handleExpand = useCallback(() => {
    setTimerOverlayVisible(true);
    setTimerMinimized(false);
  }, []);

  useEffect(() => {
    if (workoutId && programId) loadWorkout();
  }, [workoutId, programId]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const response = await programsService.getProgramWorkout(programId, workoutId);
      if (response.success && response.data) {
        setWorkout(response.data);
        setSubmitted(response.data.hasSubmitted ?? false);

        const transformedWods: WOD[] = response.data.wods.map((wod, index) => ({
          id: `wod-${index}`,
          title: wod.name,
          rawText: wod.rawText ?? undefined,
          exercises: wod.exercises.map((ex) => ({
            name: ex.name,
            instructions: ex.instructions ? [ex.instructions] : undefined,
            exerciseId: ex.exerciseId || "",
            trackingType: ex.trackingType || "reps",
          })),
          completed: false,
        }));
        setWods(transformedWods);
        const alreadySubmitted = response.data.hasSubmitted ?? false;
        setExpandedWods(alreadySubmitted ? Object.fromEntries(response.data.wods.map((_, i) => [i, true])) : {});
      } else {
        showToast({ type: "error", label: response.message || "Workout not found" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to load workout" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Page showBackButton={true} title="Workout Details">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </Page>
    );
  }

  if (!workout) {
    return (
      <Page showBackButton={true} title="Workout Details">
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error[500]} />
          <Gap size={16} />
          <Text style={styles.errorText}>Workout not found</Text>
        </View>
      </Page>
    );
  }

  const week = Math.ceil(workout.dayNumber / 7);
  const dayOfWeek = ((workout.dayNumber - 1) % 7) + 1;
  const allWodsCompleted = wods.length > 0 && wods.every((w) => w.completed);

  const toggleWodExpanded = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedWods((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleWodCompleted = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWods((prev) => {
      const current = prev[index];
      if (!current) return prev;
      const nowCompleted = !current.completed;
      if (nowCompleted) setExpandedWods((e) => ({ ...e, [index]: false }));
      return prev.map((wod, i) => (i === index ? { ...wod, completed: nowCompleted } : wod));
    });
  };

  const handleCompleteRaw = () => {
    router.push({
      pathname: "/workout/results",
      params: { workoutData: JSON.stringify(workout), type: "program", workoutId, programId },
    });
  };

  const footer = submitted ? (
    <View style={styles.completedFooterButton}>
      <Ionicons name="checkmark-circle" size={18} color="#fff" />
      <Text style={styles.footerButtonText}>Completed</Text>
    </View>
  ) : (
    <TouchableOpacity
      style={[styles.footerButton, !allWodsCompleted && styles.footerButtonDisabled]}
      activeOpacity={allWodsCompleted ? 0.85 : 1}
      disabled={!allWodsCompleted}
      onPress={() =>
        workout.wodType === "raw"
          ? handleCompleteRaw()
          : router.push({
              pathname: "/workout/results",
              params: { workoutData: JSON.stringify(workout), type: "program", workoutId, programId },
            })
      }
    >
      <Ionicons name="barbell-outline" size={18} color={allWodsCompleted ? "#fff" : Colors.text.secondary} />
      <Text style={[styles.footerButtonText, !allWodsCompleted && { color: Colors.text.secondary }]}>
        {allWodsCompleted ? "Complete Workout" : `Complete Workout (${wods.filter((w) => w.completed).length}/${wods.length})`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <Page showBackButton={true} title="Workout Details" scrollable={true} footer={footer}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutHeaderTop}>
            <View style={styles.programBadge}>
              <Ionicons name="calendar" size={12} color={Colors.primary[500]} />
              <Text style={styles.programBadgeText}>Week {week}, Day {dayOfWeek}</Text>
            </View>
          </View>
          {workout.title ? <Text style={styles.workoutTitle}>{workout.title}</Text> : null}
          <Text style={styles.workoutDate}>Day {workout.dayNumber} of your program</Text>
          {workout.notes && (
            <View style={styles.notesBox}>
              <Ionicons name="document-text-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.notesText}>{workout.notes}</Text>
            </View>
          )}

          {workout.referenceLinks && workout.referenceLinks.length > 0 && (
            <View style={styles.refVideosBox}>
              <View style={styles.refVideosHeader}>
                <Ionicons name="play-circle-outline" size={14} color={Colors.primary[500]} />
                <Text style={styles.refVideosTitle}>Reference Videos</Text>
              </View>
              {workout.referenceLinks.map((link, i) => (
                <TouchableOpacity key={i} style={styles.refVideoRow} onPress={() => Linking.openURL(link.videoLink)} activeOpacity={0.7}>
                  <Ionicons name="logo-youtube" size={16} color="#FF0000" />
                  <Text style={styles.refVideoText} numberOfLines={1}>
                    {link.exerciseName}
                  </Text>
                  <Ionicons name="open-outline" size={14} color={Colors.text.secondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Gap size={20} />

        {wods.length > 0 && !submitted && (
          <>
            <View style={styles.progressRow}>
              <Text style={styles.sectionHeader}>WODs &amp; Exercises</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>{wods.filter((w) => w.completed).length}/{wods.length} done</Text>
              </View>
            </View>
            <Gap size={4} />
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${(wods.filter((w) => w.completed).length / wods.length) * 100}%` }]} />
            </View>
            <Gap size={24} />
          </>
        )}

        {workout.wods.map((wod, i) => {
          const wodState = wods[i];
          return (
            <ExerciseCard
              key={i}
              wod={wod}
              wodIndex={i}
              isExpanded={expandedWods[i] ?? false}
              isCompleted={wodState?.completed ?? false}
              hideMarkComplete={submitted}
              onToggle={() => toggleWodExpanded(i)}
              onMarkComplete={() => toggleWodCompleted(i)}
              onOpenTimer={!submitted && wodState ? () => handleOpenTimerSetup(wodState) : undefined}
            />
          );
        })}

        {submitted && workout.userResult && (workout.userResult.results?.length > 0 || workout.userResult.comment) && (
          <>
            <Gap size={4} />
            <View style={styles.resultsSection}>
              <View style={styles.resultsSectionHeader}>
                <Ionicons name="trophy-outline" size={15} color={Colors.primary[500]} />
                <Text style={styles.resultsSectionTitle}>My Results</Text>
              </View>
              {workout.userResult.comment ? (
                <View style={styles.resultCommentRow}>
                  <Ionicons name="chatbubble-outline" size={13} color={Colors.text.secondary} />
                  <Text style={styles.resultCommentText}>{workout.userResult.comment}</Text>
                </View>
              ) : null}
              {workout.userResult.results?.map((r, i) => (
                <View key={i} style={[styles.resultRow, i < (workout.userResult?.results?.length ?? 0) - 1 && styles.resultRowBorder]}>
                  <Text style={styles.resultExerciseName} numberOfLines={1}>
                    {r.exerciseName ?? `Exercise ${i + 1}`}
                  </Text>
                  <Text style={styles.resultValue}>{formatResultValue(r)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Gap size={24} />
      </Page>

      <TimerSetupSheet visible={timerSetupVisible} onClose={() => setTimerSetupVisible(false)} onConfirm={handleTimerStart} />

      {(timerOverlayVisible || timerMinimized) && (
        <WorkoutTimerOverlay visible={timerOverlayVisible} wod={activeTimerWod} onMinimize={handleMinimize} onStop={handleTimerStop} />
      )}
      {timerMinimized && (
        <MiniTimer onExpand={handleExpand} onPlayPause={timerIsRunning ? timerPause : timerResume} onStop={handleTimerStop} />
      )}
    </View>
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
  programBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primary[500] + "18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  programBadgeText: { fontFamily: FontFamilies.spartanSemiBold, fontSize: responsiveSize(11), color: Colors.primary[500] },
  workoutTitle: { fontFamily: FontFamilies.poppinsBold, fontSize: FontSizes.headingLG, color: Colors.text.primary },
  workoutDate: { fontFamily: FontFamilies.spartanRegular, fontSize: FontSizes.bodyMD, color: Colors.text.primary },
  notesBox: { flexDirection: "row", gap: 8, alignItems: "flex-start", paddingTop: 4 },
  notesText: { fontFamily: FontFamilies.spartanRegular, fontSize: FontSizes.bodySM, color: Colors.text.secondary, flex: 1, lineHeight: 18 },
  refVideosBox: { marginTop: 12, gap: 8 },
  refVideosHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  refVideosTitle: { fontFamily: FontFamilies.spartanBold, fontSize: FontSizes.bodySM, color: Colors.primary[500], textTransform: "uppercase", letterSpacing: 0.5 },
  refVideoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.neutral[700] },
  refVideoText: { fontFamily: FontFamilies.spartanRegular, fontSize: FontSizes.bodySM, color: Colors.text.primary, flex: 1 },
  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionHeader: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: FontSizes.bodyMD, color: Colors.text.primary },
  progressBadge: { backgroundColor: Colors.primary[500] + "20", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  progressBadgeText: { fontFamily: FontFamilies.spartanSemiBold, fontSize: responsiveSize(11), color: Colors.primary[500] },
  progressBarTrack: { height: 4, backgroundColor: Colors.neutral[700], borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: 4, backgroundColor: Colors.primary[500], borderRadius: 2 },
  wodCardWrapper: { marginBottom: 28 },
  wodCard: { backgroundColor: Colors.background.secondary, borderRadius: 14, borderWidth: 1, borderColor: Colors.neutral[700], borderLeftWidth: 3, overflow: "hidden" },
  timerCornerBtn: {
    position: "absolute",
    top: -16,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  timerCornerIcon: { width: 20, height: 20 },
  wodCardCompleted: { borderColor: Colors.success[500] + "35" },
  markCompleteRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.neutral[800] + "60" },
  markCompleteRowDone: { backgroundColor: Colors.success[500] + "12" },
  markCompleteText: { fontFamily: FontFamilies.spartanMedium, fontSize: responsiveSize(12), color: Colors.text.secondary },
  markCompleteTextDone: { color: Colors.success[500] },
  wodCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.neutral[700] },
  wodCardTitle: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: FontSizes.bodyMD, color: Colors.text.primary, flex: 1, marginRight: 8 },
  wodCardContent: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2, borderTopWidth: 1, borderTopColor: Colors.neutral[700] },
  wodRawText: { fontFamily: FontFamilies.spartanRegular, fontSize: FontSizes.bodySM, color: Colors.text.primary, lineHeight: 22, paddingTop: 10 },
  exerciseRow: { flexDirection: "row", gap: 12, paddingVertical: 11, alignItems: "flex-start" },
  exerciseRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.neutral[700] + "70" },
  exerciseNumBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 1 },
  exerciseNumText: { fontFamily: FontFamilies.spartanSemiBold, fontSize: responsiveSize(11) },
  exerciseInfo: { flex: 1, gap: 4 },
  exerciseName: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: FontSizes.bodySM, color: Colors.text.primary },
  exerciseInstructions: { fontFamily: FontFamilies.spartanRegular, fontSize: FontSizes.bodyXS, color: Colors.text.secondary, lineHeight: 16 },
  trackingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  trackingBadgeText: { fontFamily: FontFamilies.spartanSemiBold, fontSize: responsiveSize(10), textTransform: "capitalize" },
  footerButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.primary[500], borderRadius: 14, paddingVertical: 14 },
  footerButtonDisabled: { backgroundColor: Colors.neutral[700] },
  completedFooterButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.success[500], borderRadius: 14, paddingVertical: 14 },
  footerButtonText: { fontFamily: FontFamilies.spartanSemiBold, fontSize: FontSizes.bodyMD, color: "#fff" },
  resultsSection: { backgroundColor: Colors.background.secondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.primary[500] + "30", gap: 10 },
  resultsSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  resultsSectionTitle: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: FontSizes.bodySM, color: Colors.primary[500] },
  resultCommentRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: Colors.neutral[700] + "80" },
  resultCommentText: { fontFamily: FontFamilies.spartanRegular, fontSize: FontSizes.bodySM, color: Colors.text.secondary, flex: 1, lineHeight: 18 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  resultRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.neutral[700] + "60", paddingBottom: 8, marginBottom: 2 },
  resultExerciseName: { fontFamily: FontFamilies.spartanMedium, fontSize: FontSizes.bodySM, color: Colors.text.primary, flex: 1, marginRight: 12 },
  resultValue: { fontFamily: FontFamilies.spartanSemiBold, fontSize: FontSizes.bodySM, color: Colors.primary[500] },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontFamily: FontFamilies.spartanMedium, fontSize: FontSizes.bodyMD, color: Colors.text.secondary },
});
