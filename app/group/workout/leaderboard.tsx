import { groupsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { LeaderboardData, LeaderboardEntry, LeaderboardExercise } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GOLD = "#FFD700";
const SILVER = "#C0C0C0";
const BRONZE = "#CD7F32";

function rankColor(rank: number) {
  if (rank === 1) return GOLD;
  if (rank === 2) return SILVER;
  if (rank === 3) return BRONZE;
  return Colors.text.secondary;
}

function rankIcon(rank: number) {
  if (rank === 1) return "trophy";
  if (rank === 2) return "medal-outline";
  if (rank === 3) return "medal-outline";
  return null;
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

function EntryValue({ entry, trackingType }: { entry: LeaderboardEntry; trackingType: string }) {
  switch (trackingType) {
    case "weight_reps":
      return (
        <View style={styles.entryValueGroup}>
          {entry.weight != null && (
            <Text style={styles.entryValueMain}>{entry.weight} kg × {entry.reps ?? "?"} reps</Text>
          )}
          {entry.estimated1RM != null && (
            <Text style={styles.entryValueSub}>Est. 1RM: {entry.estimated1RM.toFixed(1)} kg</Text>
          )}
        </View>
      );
    case "reps":
      return <Text style={styles.entryValueMain}>{entry.reps} reps</Text>;
    case "time":
    case "pace":
      return (
        <View style={styles.entryValueGroup}>
          {entry.timeInSeconds != null && (
            <Text style={styles.entryValueMain}>{formatTime(entry.timeInSeconds)}</Text>
          )}
          {trackingType === "pace" && entry.distanceMeters != null && (
            <Text style={styles.entryValueSub}>{formatDistance(entry.distanceMeters)}</Text>
          )}
        </View>
      );
    case "distance":
      return entry.distanceMeters != null
        ? <Text style={styles.entryValueMain}>{formatDistance(entry.distanceMeters)}</Text>
        : null;
    case "calories":
      return <Text style={styles.entryValueMain}>{entry.calories} cal</Text>;
    default:
      return null;
  }
}

function RankingEntry({ entry, trackingType }: { entry: LeaderboardEntry; trackingType: string }) {
  const color = rankColor(entry.rank);
  const icon = rankIcon(entry.rank);
  const isPodium = entry.rank <= 3;

  return (
    <View style={[styles.rankEntry, isPodium && styles.rankEntryPodium, isPodium && { borderColor: color + "50" }]}>
      {/* Rank badge */}
      <View style={[styles.rankBadge, isPodium && { backgroundColor: color + "20" }]}>
        {icon ? (
          <Ionicons name={icon as any} size={18} color={color} />
        ) : (
          <Text style={[styles.rankNumber, { color }]}>#{entry.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={styles.memberAvatar}>
        {entry.profilePicture ? (
          <Image source={{ uri: entry.profilePicture }} style={styles.memberAvatarImage} contentFit="cover" />
        ) : (
          <Text style={styles.memberAvatarText}>
            {(entry.userName ?? "?")[0].toUpperCase()}
          </Text>
        )}
      </View>

      {/* Name */}
      <Text style={styles.memberName} numberOfLines={1}>{entry.userName}</Text>

      {/* Value */}
      <View style={styles.entryValueWrapper}>
        <EntryValue entry={entry} trackingType={trackingType} />
      </View>
    </View>
  );
}

function ExerciseLeaderboard({ exercise }: { exercise: LeaderboardExercise }) {
  const isTimeBased = exercise.trackingType === "time" || exercise.trackingType === "pace";
  return (
    <View style={styles.exerciseSection}>
      <View style={styles.exerciseSectionHeader}>
        <View style={styles.exerciseSectionTitleRow}>
          <Text style={styles.exerciseSectionWod}>{exercise.wodName}</Text>
          <Text style={styles.exerciseSectionDot}>·</Text>
          <Text style={styles.exerciseSectionName}>{exercise.exerciseName}</Text>
        </View>
        <View style={styles.trackingBadge}>
          <Text style={styles.trackingBadgeText}>
            {isTimeBased ? "Fastest" : exercise.trackingType.replace("_", " ")}
          </Text>
        </View>
      </View>

      {exercise.rankings.length === 0 ? (
        <View style={styles.noSubmissions}>
          <Ionicons name="hourglass-outline" size={24} color={Colors.text.secondary} />
          <Text style={styles.noSubmissionsText}>No submissions yet</Text>
        </View>
      ) : (
        exercise.rankings.map((entry) => (
          <RankingEntry key={entry.userId} entry={entry} trackingType={exercise.trackingType} />
        ))
      )}
    </View>
  );
}

export default function LeaderboardScreen() {
  const { groupId, workoutId } = useLocalSearchParams<{ groupId: string; workoutId: string }>();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { canAccess } = useEntitlements();

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupsService.getLeaderboard(groupId, workoutId);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to load leaderboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
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
            Leaderboards are a coach feature. Apply to become a coach from your profile.
          </Text>
          <Gap size={20} />
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => Alert.alert("Coach Feature", "Leaderboards are a coach feature. Apply to become a coach from your profile.")}
            activeOpacity={0.8}
          >
            <Ionicons name="information-circle-outline" size={14} color="#000" />
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

  if (error || !data) {
    return (
      <Page showBackButton={true} title="Leaderboard">
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error[500]} />
          <Gap size={16} />
          <Text style={styles.errorText}>{error || "Leaderboard not available"}</Text>
        </View>
      </Page>
    );
  }

  const scheduledDate = new Date(data.scheduledFor);

  return (
    <Page showBackButton={true} title="Leaderboard" scrollable={true}>
      {/* Header */}
      <View style={styles.lbHeader}>
        <View style={styles.trophyRing}>
          <Ionicons name="trophy" size={32} color={GOLD} />
        </View>
        <Gap size={12} />
        <Text style={styles.lbTitle}>{data.workoutTitle || "Group Workout"}</Text>
        <Text style={styles.lbDate}>
          {scheduledDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <Gap size={20} />

      {/* Per-exercise leaderboards */}
      {data.exercises.map((exercise, i) => (
        <ExerciseLeaderboard key={i} exercise={exercise} />
      ))}

      <Gap size={80} />
    </Page>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: FontSizes.bodyMD, color: Colors.text.secondary },
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
  exerciseSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  exerciseSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },
  exerciseSectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  exerciseSectionWod: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(11),
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exerciseSectionDot: { color: Colors.text.secondary },
  exerciseSectionName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    flex: 1,
  },
  trackingBadge: {
    backgroundColor: Colors.primary[500] + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trackingBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
    color: Colors.primary[500],
    textTransform: "capitalize",
  },
  rankEntry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  rankEntryPodium: {
    borderWidth: 1.5,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
  },
  rankNumber: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(13),
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500] + "20",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  memberAvatarImage: { width: 36, height: 36, borderRadius: 18 },
  memberAvatarText: { fontFamily: FontFamilies.poppinsBold, fontSize: FontSizes.bodySM, color: Colors.primary[500] },
  memberName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    flex: 1,
  },
  entryValueWrapper: { alignItems: "flex-end" },
  entryValueGroup: { alignItems: "flex-end", gap: 2 },
  entryValueMain: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  entryValueSub: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  noSubmissions: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  noSubmissionsText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
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
