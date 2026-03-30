import { groupsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
import type { GroupWorkout, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function GroupWorkoutDetailScreen() {
  const { workoutId, groupId } = useLocalSearchParams<{
    workoutId: string;
    groupId: string;
  }>();
  const [workout, setWorkout] = useState<GroupWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
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

  const footer = !submitted ? (
    <TouchableOpacity
      style={styles.footerButton}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
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
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
  },
});
