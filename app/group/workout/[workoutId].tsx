import { groupsService } from "@/api/services";
import { tabIcons } from "@/assets/images";
import { BulletTextArea, Button, Gap, Page } from "@/components";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { MiniTimer } from "@/components/timer/MiniTimer";
import { TimerSetupSheet } from "@/components/timer/TimerSetupSheet";
import { WorkoutTimerOverlay } from "@/components/timer/WorkoutTimerOverlay";
import type { TimerWOD } from "@/components/timer/WorkoutTimerOverlay";
import WorkoutView from "@/components/workouts/WorkoutView";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { audioService } from "@/lib/timer/services/AudioService";
import type { WODConfig } from "@/lib/timer/types";
import { useTimerStore } from "@/lib/timer/viewmodels/timerStore";
import type { GroupWorkout, ResultData, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
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
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const accentColor = isCompleted ? Colors.success[500] : Colors.primary[500];

  return (
    <View style={styles.wodCardWrapper}>
    <View
      style={[
        styles.wodCard,
        { borderLeftColor: accentColor },
        isCompleted && styles.wodCardCompleted,
      ]}
    >
      {/* Mark as Completed */}
      {!hideMarkComplete && (
        <TouchableOpacity
          style={[
            styles.markCompleteRow,
            isCompleted && styles.markCompleteRowDone,
          ]}
          onPress={onMarkComplete}
          activeOpacity={0.75}
        >
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
            size={17}
            color={isCompleted ? Colors.success[500] : Colors.text.secondary}
          />
          <Text
            style={[
              styles.markCompleteText,
              isCompleted && styles.markCompleteTextDone,
            ]}
          >
            {isCompleted ? "Completed" : "Mark as Completed"}
          </Text>
        </TouchableOpacity>
      )}

      {/* WOD name header – tappable accordion toggle */}
      <TouchableOpacity
        style={[
          styles.wodCardHeader,
          !hideMarkComplete && { borderTopColor: Colors.neutral[700] },
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.wodCardTitle,
            isCompleted && { color: Colors.success[500] },
          ]}
        >
          {wod.name || `WOD ${wodIndex + 1}`}
        </Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={isCompleted ? Colors.success[500] : Colors.text.secondary}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Expandable content */}
      {isExpanded && (
        <View style={styles.wodCardContent}>
          {wod.rawText ? (
            <Text style={styles.wodRawText}>{wod.rawText}</Text>
          ) : (
            wod.exercises.map((ex, i) => (
              <View
                key={i}
                style={[
                  styles.exerciseRow,
                  i < wod.exercises.length - 1 && styles.exerciseRowBorder,
                ]}
              >
                {/* Number badge */}
                <View
                  style={[
                    styles.exerciseNumBadge,
                    { backgroundColor: accentColor + "20" },
                  ]}
                >
                  <Text
                    style={[styles.exerciseNumText, { color: accentColor }]}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                </View>

                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  {ex.instructions ? (
                    <Text style={styles.exerciseInstructions}>
                      {ex.instructions}
                    </Text>
                  ) : null}
                  <View
                    style={[
                      styles.trackingBadge,
                      { backgroundColor: accentColor + "18" },
                    ]}
                  >
                    <Text
                      style={[styles.trackingBadgeText, { color: accentColor }]}
                    >
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

    {/* Timer corner button — floats outside card top-right */}
    {!hideMarkComplete && onOpenTimer && (
      <TouchableOpacity
        style={styles.timerCornerBtn}
        onPress={onOpenTimer}
        activeOpacity={0.85}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Image
          source={tabIcons.timer}
          style={styles.timerCornerIcon}
          resizeMode="contain"
        />
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

export default function GroupWorkoutDetailScreen() {
  const { workoutId, groupId } = useLocalSearchParams<{
    workoutId: string;
    groupId: string;
  }>();
  const navigation = useNavigation();
  const [workout, setWorkout] = useState<GroupWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [wods, setWods] = useState<WOD[]>([]);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editedWods, setEditedWods] = useState<WOD[]>([]);
  const [expandedWods, setExpandedWods] = useState<Record<number, boolean>>({});
  const [publishMode, setPublishMode] = useState<"unchanged" | "now" | "scheduled">("unchanged");
  const [publishedAt, setPublishedAt] = useState<Date>(new Date());
  const [showPublishDatePicker, setShowPublishDatePicker] = useState(false);
  const { showToast } = useToast();
  const globalState = useGlobalState();

  // ─── Workout timer state ───────────────────────────────────────────────────
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
      const timerWod: TimerWOD = {
        id: wod.id,
        title: wod.title,
        exercises: wod.exercises,
        rawText: wod.rawText,
        completed: wod.completed,
      };
      if ((timerIsRunning || timerHasStarted) && !timerIsComplete) {
        Alert.alert(
          "Timer Already Running",
          "A timer is already running. Stop it to start a new one.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Stop Timer",
              style: "destructive",
              onPress: () => {
                timerStop();
                setTimerOverlayVisible(false);
                setTimerMinimized(false);
                setActiveTimerWod(timerWod);
                setTimerSetupVisible(true);
              },
            },
          ],
        );
        return;
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
    if (workoutId && groupId) loadWorkout();
  }, [workoutId, groupId]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const response = await groupsService.getGroupWorkout(groupId, workoutId);
      if (response.success && response.data) {
        setWorkout(response.data);
        setSubmitted(response.data.hasSubmitted ?? false);

        const transformedWods: WOD[] = response.data.wods.map(
          (wod, index) => ({
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
          }),
        );
        setWods(transformedWods);
        const alreadySubmitted = response.data.hasSubmitted ?? false;
        setExpandedWods(
          alreadySubmitted
            ? Object.fromEntries(response.data.wods.map((_, i) => [i, true]))
            : {},
        );
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

  const allWodsCompleted =
    wods.length > 0 && wods.every((w) => w.completed);

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
      if (nowCompleted) {
        setExpandedWods((e) => ({ ...e, [index]: false }));
      }
      return prev.map((wod, i) =>
        i === index ? { ...wod, completed: nowCompleted } : wod,
      );
    });
  };

  const handleCompleteRaw = () => {
    router.push({
      pathname: "/workout/results",
      params: {
        workoutData: JSON.stringify(workout),
        type: "group",
        workoutId,
        groupId,
      },
    });
  };

  const handleEditWorkout = () => {
    setEditedWods(JSON.parse(JSON.stringify(wods)));
    setPublishMode("unchanged");
    setIsEditingWorkout(true);
  };

  const handleCancelEdit = () => {
    setIsEditingWorkout(false);
    setEditedWods([]);
    setPublishMode("unchanged");
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await groupsService.deleteGroupWorkout(
                groupId,
                workoutId,
              );
              if (response.success) {
                router.back();
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

  const handleViewLeaderboard = () => {
    router.push(`/group/workout/leaderboard?groupId=${groupId}&workoutId=${workoutId}`);
  };

  const handleSaveWorkout = async () => {
    try {
      setLoading(true);
      const updatedWods =
        workout.wodType === "raw"
          ? editedWods.map((wod) => ({
              name: wod.title || "Untitled WOD",
              rawText: wod.rawText ?? "",
              exercises: [],
            }))
          : editedWods.map((wod) => ({
              name: wod.title || "Untitled WOD",
              exercises: wod.exercises.map((ex) => ({
                exerciseId: ex.exerciseId || "",
                name: ex.name || "Exercise",
                instructions: ex.instructions?.[0] || "",
                trackingType: (ex.trackingType || "reps") as any,
              })),
            }));

      const updatePayload: Parameters<typeof groupsService.updateGroupWorkout>[2] = { wods: updatedWods };
      if (publishMode === "now") updatePayload.publishedAt = null;
      else if (publishMode === "scheduled") updatePayload.publishedAt = publishedAt.toISOString();

      const response = await groupsService.updateGroupWorkout(
        groupId,
        workoutId,
        updatePayload,
      );
      if (response.success) {
        setIsEditingWorkout(false);
        await loadWorkout();
        showToast({ type: "success", label: "Workout updated successfully!" });
      } else {
        showToast({
          type: "error",
          label: response.message || "Failed to update workout",
        });
      }
    } catch (err: any) {
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

  const updateWodRawText = (wodId: string, rawText: string) => {
    setEditedWods((prev) =>
      prev.map((wod) => (wod.id === wodId ? { ...wod, rawText } : wod)),
    );
  };

  const selectExercise = (
    wodId: string,
    exerciseIndex: number,
    exercise: { id: string; name: string; trackingType: string },
  ) => {
    setEditedWods((prev) =>
      prev.map((wod) => {
        if (wod.id === wodId) {
          const updatedExercises = wod.exercises.map((ex, idx) =>
            idx === exerciseIndex
              ? {
                  ...ex,
                  name: exercise.name,
                  exerciseId: exercise.id,
                  trackingType: exercise.trackingType,
                }
              : ex,
          );
          return { ...wod, exercises: updatedExercises };
        }
        return wod;
      }),
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
              return field === "name"
                ? { ...ex, name: value }
                : { ...ex, instructions: [value] };
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
      exercises: [{ name: "", instructions: [""] }],
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
              exercises: [...wod.exercises, { name: "", instructions: [""] }],
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

  const footer = isEditingWorkout ? (
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
  ) : submitted ? (
    <View style={styles.completedFooterButton}>
      <Ionicons name="checkmark-circle" size={18} color="#fff" />
      <Text style={styles.footerButtonText}>Completed</Text>
    </View>
  ) : (
    <TouchableOpacity
      style={[
        styles.footerButton,
        !allWodsCompleted && styles.footerButtonDisabled,
      ]}
      activeOpacity={allWodsCompleted ? 0.85 : 1}
      disabled={!allWodsCompleted}
      onPress={() =>
        workout.wodType === "raw"
          ? handleCompleteRaw()
          : router.push({
              pathname: "/workout/results",
              params: {
                workoutData: JSON.stringify(workout),
                type: "group",
                workoutId,
                groupId,
              },
            })
      }
    >
      <Ionicons
        name="barbell-outline"
        size={18}
        color={allWodsCompleted ? "#fff" : Colors.text.secondary}
      />
      <Text
        style={[
          styles.footerButtonText,
          !allWodsCompleted && { color: Colors.text.secondary },
        ]}
      >
        {allWodsCompleted
          ? "Complete Workout"
          : `Complete Workout (${wods.filter((w) => w.completed).length}/${wods.length})`}
      </Text>
    </TouchableOpacity>
  );

  const headerRight = isAdmin ? (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {!isEditingWorkout ? (
        <>
          <TouchableOpacity
            onPress={handleViewLeaderboard}
            style={styles.headerIconBtn}
          >
            <Ionicons
              name="podium-outline"
              size={22}
              color={Colors.primary[500]}
            />
          </TouchableOpacity>
          {!submitted && (
            <TouchableOpacity
              onPress={handleEditWorkout}
              style={styles.headerIconBtn}
            >
              <Ionicons
                name="create-outline"
                size={22}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleDeleteWorkout}
            style={styles.headerIconBtn}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={Colors.error[500]}
            />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={handleCancelEdit}
          style={styles.headerIconBtn}
        >
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      )}
    </View>
  ) : null;

  return (
    <View style={{ flex: 1 }}>
    <Page
      showBackButton={true}
      title={"Workout Details"}
      scrollable={true}
      footer={footer}
      headerRight={headerRight}
    >
      {isEditingWorkout ? (
        <>
          {/* Publish controls — always visible in edit mode */}
          <View style={styles.publishSection}>
            <Text style={styles.publishSectionLabel}>Notification</Text>
            <View style={styles.publishToggle}>
              {(["unchanged", "now", "scheduled"] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.publishTab, publishMode === mode && styles.publishTabActive]}
                  onPress={() => setPublishMode(mode)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.publishTabText, publishMode === mode && styles.publishTabTextActive]}>
                    {mode === "unchanged" ? "Keep" : mode === "now" ? "Send Now" : "Reschedule"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {publishMode === "scheduled" && (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowPublishDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {publishedAt.toLocaleDateString("en-GB")}
                  </Text>
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

        {workout.wodType === "raw" ? (
          <View style={styles.editRawContainer}>
            {editedWods.map((wod, i) => (
              <View key={wod.id} style={styles.editRawWodCard}>
                <View style={styles.editRawWodHeader}>
                  <Text style={styles.editRawWodLabel}>WOD {i + 1}</Text>
                  {editedWods.length > 1 && (
                    <TouchableOpacity
                      style={styles.editRemoveWodBtn}
                      onPress={() => handleRemoveWod(wod.id)}
                    >
                      <Text style={styles.editRemoveWodText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.editInputGroup}>
                  <Text style={styles.editInputLabel}>WOD Name</Text>
                  <TextInput
                    style={styles.editInput}
                    value={wod.title}
                    onChangeText={(t) => updateWodTitle(wod.id, t)}
                    placeholder='e.g., "Metcon" or "Strength"'
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                <View style={styles.editInputGroup}>
                  <Text style={styles.editInputLabel}>Workout Description</Text>
                  <BulletTextArea
                    inputContainerStyle={styles.editRawTextarea}
                    inputStyle={styles.editRawTextareaInput}
                    value={wod.rawText ?? ""}
                    onChangeText={(t) => updateWodRawText(wod.id, t)}
                    placeholder={"Describe this WOD..."}
                    minHeight={160}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.editAddWodBtn}
              onPress={handleAddWod}
            >
              <Text style={styles.editAddWodText}>+ Add WOD</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WorkoutView
            wods={editedWods}
            isEditingWorkout={true}
            expandedExercises={{}}
            animatedValues={{}}
            onToggleExercise={() => {}}
            onToggleWODCompletion={() => {}}
            onUpdateWodTitle={updateWodTitle}
            onUpdateExercise={updateExercise}
            onSelectExercise={selectExercise}
            onAddWod={handleAddWod}
            onRemoveWod={handleRemoveWod}
            onAddExercise={handleAddExercise}
            onRemoveExercise={handleRemoveExercise}
          />
        )}
        </>
      ) : (
        <>
          {/* Workout header */}
          <View style={styles.workoutHeader}>
            <View style={styles.workoutHeaderTop}>
              <View style={styles.groupBadge}>
                <Ionicons name="people" size={12} color={Colors.primary[500]} />
                <Text style={styles.groupBadgeText}>Group Workout</Text>
              </View>
            </View>
            {workout.title ? (
              <Text style={styles.workoutTitle}>{workout.title}</Text>
            ) : null}
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

          <Gap size={20} />

          {/* Progress indicator */}
          {wods.length > 0 && !submitted && (
            <>
              <View style={styles.progressRow}>
                <Text style={styles.sectionHeader}>WODs &amp; Exercises</Text>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    {wods.filter((w) => w.completed).length}/{wods.length}{" "}
                    done
                  </Text>
                </View>
              </View>
              <Gap size={4} />
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(wods.filter((w) => w.completed).length / wods.length) * 100}%`,
                    },
                  ]}
                />
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
                onOpenTimer={
                  !submitted && wodState
                    ? () => handleOpenTimerSetup(wodState)
                    : undefined
                }
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
                  <View
                    key={i}
                    style={[
                      styles.resultRow,
                      i < (workout.userResult?.results?.length ?? 0) - 1 && styles.resultRowBorder,
                    ]}
                  >
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
        </>
      )}
    </Page>

    {/* ── Timer setup sheet ── */}
    <TimerSetupSheet
      visible={timerSetupVisible}
      onClose={() => setTimerSetupVisible(false)}
      onConfirm={handleTimerStart}
    />

    {/* ── Timer overlay + mini pill ── */}
    {(timerOverlayVisible || timerMinimized) && (
      <WorkoutTimerOverlay
        visible={timerOverlayVisible}
        wod={activeTimerWod}
        onMinimize={handleMinimize}
        onStop={handleTimerStop}
      />
    )}
    {timerMinimized && (
      <MiniTimer
        onExpand={handleExpand}
        onPlayPause={timerIsRunning ? timerPause : timerResume}
        onStop={handleTimerStop}
      />
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
  workoutTitle: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
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
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeader: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  progressBadge: {
    backgroundColor: Colors.primary[500] + "20",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  progressBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
    color: Colors.primary[500],
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: Colors.neutral[700],
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  /* WOD accordion card */
  wodCardWrapper: {
    marginBottom: 28,
  },
  wodCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderLeftWidth: 3,
    overflow: "hidden",
  },
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
  timerCornerIcon: {
    width: 20,
    height: 20,
  },
  wodCardCompleted: {
    borderColor: Colors.success[500] + "35",
  },
  markCompleteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.neutral[800] + "60",
  },
  markCompleteRowDone: {
    backgroundColor: Colors.success[500] + "12",
  },
  markCompleteText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: responsiveSize(12),
    color: Colors.text.secondary,
  },
  markCompleteTextDone: {
    color: Colors.success[500],
  },
  wodCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
  },
  wodCardTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  wodCardContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
  },
  wodRawText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    lineHeight: 22,
    paddingTop: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 11,
    alignItems: "flex-start",
  },
  exerciseRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700] + "70",
  },
  exerciseNumBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  exerciseNumText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  trackingBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
    textTransform: "capitalize",
  },
  /* Publish controls */
  publishSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    gap: 10,
  },
  publishSectionLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: responsiveSize(12),
    color: Colors.text.secondary,
  },
  publishToggle: {
    flexDirection: "row",
    backgroundColor: Colors.background.primary,
    borderRadius: 10,
    padding: 3,
  },
  publishTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  publishTabActive: {
    backgroundColor: Colors.primary[500],
  },
  publishTabText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(12),
    color: Colors.text.secondary,
  },
  publishTabTextActive: {
    color: "#000000",
  },
  dateButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.text.tertiary,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dateButtonText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(14),
    color: Colors.text.primary,
  },
  doneButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 6,
  },
  doneButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(14),
    color: "#fff",
  },
  /* Edit mode */
  editRawContainer: {
    paddingTop: 8,
  },
  editRawWodCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  editRawWodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  editRawWodLabel: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  editRemoveWodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Colors.error[500],
    borderRadius: 6,
  },
  editRemoveWodText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(12),
    color: "#fff",
  },
  editInputGroup: {
    marginBottom: 12,
  },
  editInputLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: responsiveSize(12),
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  editInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text.primary,
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsRegular,
  },
  editRawTextarea: {
    minHeight: 160,
  },
  editRawTextareaInput: {
    color: Colors.text.primary,
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsRegular,
  },
  editAddWodBtn: {
    backgroundColor: Colors.primary[500],
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  editAddWodText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: "#000",
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
  footerButtonDisabled: {
    backgroundColor: Colors.neutral[700],
  },
  completedFooterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.success[500],
    borderRadius: 14,
    paddingVertical: 14,
  },
  footerButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: "#fff",
  },
  resultsSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "30",
    gap: 10,
  },
  resultsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultsSectionTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  resultCommentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700] + "80",
  },
  resultCommentText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  resultRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700] + "60",
    paddingBottom: 8,
    marginBottom: 2,
  },
  resultExerciseName: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  resultValue: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
  },
});
