import { workoutsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { AssignedWorkoutData } from "@/types";
import { parseFirebaseDate } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_SIZE = 20;

function HistoryWorkoutItem({ workout }: { workout: AssignedWorkoutData }) {
  const date = parseFirebaseDate(workout.scheduledFor);
  const isGroup = workout.source === "group";
  const isDone = isGroup ? (workout.hasSubmitted ?? false) : workout.completed;
  const status = isDone
    ? { label: "Done", color: Colors.success[500], icon: "checkmark-circle" as const }
    : { label: "Missed", color: Colors.error[500], icon: "close-circle-outline" as const };
  const accentColor = isGroup ? Colors.primary[500] : Colors.fitness.strength;

  const handlePress = () => {
    if (isGroup && workout.groupId && workout.id) {
      router.push(`/group/workout/${workout.id}?groupId=${workout.groupId}`);
    } else if (workout.id) {
      router.push(`/workout/${workout.id}`);
    }
  };

  return (
    <Pressable style={styles.item} onPress={handlePress}>
      <View style={[styles.itemIconWrap, { backgroundColor: accentColor + "18", borderColor: accentColor + "40" }]}>
        <Ionicons name="barbell-outline" size={20} color={accentColor} />
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {workout.title || workout.wods[0]?.name || "Workout"}
        </Text>
        <View style={styles.itemMeta}>
          <Ionicons name="calendar-outline" size={11} color={Colors.text.secondary} />
          <Text style={styles.itemMetaText}>
            {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </Text>
          {isGroup && workout.groupName && (
            <>
              <Text style={styles.itemDot}>·</Text>
              <Ionicons name="people-outline" size={11} color={Colors.text.secondary} />
              <Text style={styles.itemMetaText} numberOfLines={1}>{workout.groupName}</Text>
            </>
          )}
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: status.color + "18" }]}>
        <Ionicons name={status.icon} size={11} color={status.color} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>
    </Pressable>
  );
}

export default function WorkoutHistoryScreen() {
  const [workouts, setWorkouts] = useState<AssignedWorkoutData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory(null, false);
  }, []);

  const loadHistory = async (cursorParam: string | null, isLoadMore: boolean) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      setError(null);
      const res = await workoutsService.getWorkoutHistory(PAGE_SIZE, cursorParam);
      if (res.success && res.data) {
        setWorkouts((prev) => isLoadMore ? [...prev, ...res.data] : res.data);
        setCursor(res.nextCursor ?? null);
        setHasMore(!!res.nextCursor);
      } else {
        setError(res.message || "Failed to load history");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <Page showBackButton={true} title="Workout History">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page showBackButton={true} title="Workout History">
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.error[500]} />
          <Gap size={16} />
          <Text style={styles.errorText}>{error}</Text>
          <Gap size={16} />
          <TouchableOpacity style={styles.retryButton} onPress={() => loadHistory(null, false)}>
            <Ionicons name="refresh" size={16} color={Colors.primary[500]} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Page>
    );
  }

  if (workouts.length === 0) {
    return (
      <Page showBackButton={true} title="Workout History">
        <View style={styles.centerContainer}>
          <Ionicons name="archive-outline" size={52} color={Colors.text.secondary} />
          <Gap size={16} />
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptySubtext}>
            Completed workouts will appear here.
          </Text>
        </View>
      </Page>
    );
  }

  return (
    <Page showBackButton={true} title="Workout History" scrollable={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {workouts.map((workout, i) => (
          <View key={`${workout.id}-${i}`}>
            <HistoryWorkoutItem workout={workout} />
            {i < workouts.length - 1 && <Gap size={10} />}
          </View>
        ))}

        {hasMore && (
          <>
            <Gap size={12} />
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => loadHistory(cursor, true)}
              disabled={loadingMore}
              activeOpacity={0.75}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={Colors.primary[500]} />
              ) : (
                <>
                  <Ionicons name="chevron-down" size={16} color={Colors.primary[500]} />
                  <Text style={styles.loadMoreText}>Load More</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        <Gap size={40} />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.error[500],
    textAlign: "center",
  },
  emptyTitle: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "50",
  },
  retryText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
  },
  listContent: {
    paddingTop: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    padding: 12,
    gap: 12,
  },
  itemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
    gap: 5,
  },
  itemTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  itemMetaText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  itemDot: {
    color: Colors.neutral[600],
    fontSize: FontSizes.bodyXS,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "40",
    backgroundColor: Colors.background.secondary,
  },
  loadMoreText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
  },
});
