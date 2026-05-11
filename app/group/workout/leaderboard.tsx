import { groupsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useEntitlements } from "@/hooks/useEntitlements";
import type {
  LeaderboardExerciseResult,
  LeaderboardUserResult,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GOLD = "#FFD700";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters} m`;
}

function formatExerciseValue(ex: LeaderboardExerciseResult): string {
  switch (ex.trackingType) {
    case "weight_reps":
      if (ex.weight != null && ex.reps != null)
        return `${ex.weight} kg × ${ex.reps} reps`;
      if (ex.weight != null) return `${ex.weight} kg`;
      if (ex.reps != null) return `${ex.reps} reps`;
      return "—";
    case "reps":
      return ex.reps != null ? `${ex.reps} reps` : "—";
    case "time":
    case "pace":
      return ex.timeInSeconds != null ? formatTime(ex.timeInSeconds) : "—";
    case "distance":
      return ex.distanceMeters != null ? formatDistance(ex.distanceMeters) : "—";
    case "calories":
      return ex.calories != null ? `${ex.calories} cal` : "—";
    default:
      return "—";
  }
}

function calcImprovement(ex: LeaderboardExerciseResult): string | null {
  if (!ex.isPR || !ex.previousBest) return null;
  const pb = ex.previousBest;

  switch (ex.trackingType) {
    case "weight_reps": {
      if (ex.weight == null || ex.reps == null || pb.estimated1RM == null) return null;
      const curr1RM = ex.weight * (1 + ex.reps / 30);
      const delta = curr1RM - pb.estimated1RM;
      return `+${delta.toFixed(1)} kg 1RM`;
    }
    case "reps": {
      if (ex.reps == null || pb.reps == null) return null;
      const delta = ex.reps - pb.reps;
      return delta > 0 ? `+${delta} reps` : null;
    }
    case "distance": {
      if (ex.distanceMeters == null || pb.distanceMeters == null) return null;
      const delta = ex.distanceMeters - pb.distanceMeters;
      return delta > 0 ? `+${formatDistance(delta)}` : null;
    }
    case "calories": {
      if (ex.calories == null || pb.calories == null) return null;
      const delta = ex.calories - pb.calories;
      return delta > 0 ? `+${delta} cal` : null;
    }
    case "time":
    case "pace": {
      if (ex.timeInSeconds == null || pb.timeInSeconds == null) return null;
      const delta = pb.timeInSeconds - ex.timeInSeconds;
      return delta > 0 ? `-${formatTime(delta)}` : null;
    }
    default:
      return null;
  }
}

function ExerciseResultRow({ ex }: { ex: LeaderboardExerciseResult }) {
  const improvement = calcImprovement(ex);
  return (
    <View style={styles.exRow}>
      <View style={styles.exLeft}>
        <Text style={styles.exWodName} numberOfLines={1}>
          {ex.wodName} · {ex.exerciseName}
        </Text>
        <Text style={styles.exValue}>{formatExerciseValue(ex)}</Text>
      </View>
      {ex.isPR && (
        <View style={styles.prBadge}>
          <Ionicons name="star" size={10} color="#000" />
          <Text style={styles.prBadgeText}>PR</Text>
          {improvement && (
            <Text style={styles.prImprovement}>{improvement}</Text>
          )}
        </View>
      )}
    </View>
  );
}

function SubmissionCard({
  result,
  index,
}: {
  result: LeaderboardUserResult;
  index: number;
}) {
  return (
    <View style={styles.card}>
      {/* User info row */}
      <View style={styles.cardHeader}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.avatarWrap}>
          {result.profilePicture ? (
            <Image
              source={{ uri: result.profilePicture }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.avatarInitial}>
              {(result.userName ?? "?")[0].toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {result.userName}
          </Text>
          <Text style={styles.submitTime}>{timeAgo(result.submittedAt)}</Text>
        </View>
      </View>

      {/* Comment */}
      {result.comment ? (
        <View style={styles.commentRow}>
          <Ionicons
            name="chatbubble-outline"
            size={12}
            color={Colors.text.secondary}
          />
          <Text style={styles.commentText} numberOfLines={2}>
            {result.comment}
          </Text>
        </View>
      ) : null}

      {/* Exercise results */}
      {result.exercises.length > 0 && (
        <View style={styles.exList}>
          {result.exercises.map((ex, i) => (
            <ExerciseResultRow key={i} ex={ex} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function LeaderboardScreen() {
  const { groupId, workoutId } = useLocalSearchParams<{
    groupId: string;
    workoutId: string;
  }>();

  const [results, setResults] = useState<LeaderboardUserResult[]>([]);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { canAccess } = useEntitlements();

  const loadLeaderboard = async (cursor?: string) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const response = await groupsService.getLeaderboard(groupId, workoutId, {
        limit: 20,
        ...(cursor ? { startAfter: cursor } : {}),
      });

      if (response.success && response.data) {
        const d = response.data;
        setWorkoutTitle(d.workoutTitle);
        setScheduledFor(d.scheduledFor);
        setNextCursor(d.nextCursor ?? null);
        setResults((prev) => (cursor ? [...prev, ...d.results] : d.results));
      } else {
        setError(response.message || "Failed to load leaderboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (groupId && workoutId && canAccess("leaderboard")) loadLeaderboard();
  }, [groupId, workoutId, canAccess]);

  if (!canAccess("leaderboard")) {
    return (
      <Page showBackButton={true} title="Leaderboard">
        <View style={styles.centerContainer}>
          <View style={styles.lockRing}>
            <Ionicons name="lock-closed" size={32} color={Colors.primary[500]} />
          </View>
          <Gap size={16} />
          <Text style={styles.lockTitle}>Coach Feature</Text>
          <Text style={styles.lockMessage}>
            Leaderboards are a coach feature. Apply to become a coach from your
            profile.
          </Text>
          <Gap size={20} />
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() =>
              Alert.alert(
                "Coach Feature",
                "Leaderboards are a coach feature. Apply to become a coach from your profile.",
              )
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#000"
            />
            <Text style={styles.upgradeBtnText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </Page>
    );
  }

  if (loading) {
    return (
      <Page showBackButton={true} title="Leaderboard">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page showBackButton={true} title="Leaderboard">
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors.error[500]}
          />
          <Gap size={16} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Page>
    );
  }

  const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;

  return (
    <Page showBackButton={true} title="Leaderboard" scrollable={true}>
      {/* Header */}
      <View style={styles.lbHeader}>
        <View style={styles.trophyRing}>
          <Ionicons name="trophy" size={32} color={GOLD} />
        </View>
        <Gap size={12} />
        <Text style={styles.lbTitle}>{workoutTitle || "Group Workout"}</Text>
        {scheduledDate && (
          <Text style={styles.lbDate}>
            {scheduledDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        )}
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {results.length} submission{results.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <Gap size={16} />

      {results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="hourglass-outline"
            size={40}
            color={Colors.text.secondary}
          />
          <Gap size={12} />
          <Text style={styles.emptyText}>No submissions yet</Text>
        </View>
      ) : (
        <>
          {results.map((result, i) => (
            <SubmissionCard key={result.userId} result={result} index={i} />
          ))}

          {nextCursor && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => loadLeaderboard(nextCursor)}
              disabled={loadingMore}
              activeOpacity={0.8}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={Colors.primary[500]} />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}

      <Gap size={80} />
    </Page>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  lbHeader: { alignItems: "center", paddingVertical: 20 },
  trophyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GOLD + "18",
    borderWidth: 2,
    borderColor: GOLD + "50",
    alignItems: "center",
    justifyContent: "center",
  },
  lbTitle: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
    textAlign: "center",
  },
  lbDate: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  countBadge: {
    marginTop: 10,
    backgroundColor: Colors.primary[500] + "18",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(12),
    color: Colors.primary[500],
  },
  /* Submission card */
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  indexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.neutral[700],
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(11),
    color: Colors.text.secondary,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary[500] + "20",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  avatarInitial: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  userInfo: { flex: 1, gap: 1 },
  userName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  submitTime: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(11),
    color: Colors.text.secondary,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: Colors.neutral[800] + "60",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  commentText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  exList: {
    gap: 6,
  },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  exLeft: { flex: 1, gap: 1 },
  exWodName: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(11),
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  exValue: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary[500],
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  prBadgeText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(10),
    color: "#000",
  },
  prImprovement: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
    color: "#000",
  },
  /* Load more */
  loadMoreBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    marginBottom: 8,
    minHeight: 48,
  },
  loadMoreText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  /* Empty */
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
  /* Lock screen */
  lockRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[500] + "15",
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  lockTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    textAlign: "center",
  },
  lockMessage: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  upgradeBtnText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: "#000000",
  },
});
