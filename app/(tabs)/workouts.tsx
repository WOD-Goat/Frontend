import { workoutsService } from "@/api/services";
import { Gap, Page, WorkoutHeader, WorkoutSection } from "@/components";
import { useGlobalState } from "@/components/lib";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { AssignedWorkoutData } from "@/types";
import { formatShortDate, parseFirebaseDate } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_SIZE = 7;

interface WorkoutSectionData {
  date: string;
  status: "not-started-yet" | "completed" | "missed";
  workoutId: string;
  wods: {
    id: string;
    title: string;
    exercises: string[];
  }[];
  workoutType: string;
}

export default function WorkoutsScreen() {
  const [workoutSections, setWorkoutSections] = useState<WorkoutSectionData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startAfter, setStartAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const globalState = useGlobalState();
  const user = globalState.get("user");

  useEffect(() => {
    loadWorkouts(null, false);
  }, []);

  const loadWorkouts = async (
    startAfter: string | null,
    isLoadMore: boolean,
  ) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await workoutsService.getAllWorkouts(
        PAGE_SIZE,
        startAfter,
      );

      if (response.success && response.data) {
        const newSections = transformWorkoutsToSections(response.data);
        if (isLoadMore) {
          setWorkoutSections((prev) => [...prev, ...newSections]);
        } else {
          setWorkoutSections(newSections);
        }
        if (response.data.length >= PAGE_SIZE) {
          const last = response.data[response.data.length - 1];
          const lastDate = parseFirebaseDate(last.scheduledFor);
          setStartAfter(lastDate.toISOString());
          setHasMore(true);
        } else {
          setStartAfter(null);
          setHasMore(false);
        }
      } else {
        setError(response.message || "Failed to load workouts");
      }
    } catch (err: any) {
      console.error("Error loading workouts:", err);
      setError(err.message || "Failed to load workouts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadWorkouts(startAfter, true);
  };

  const transformWorkoutsToSections = (
    workouts: AssignedWorkoutData[],
  ): WorkoutSectionData[] => {
    return workouts.map((workout) => {
      const dateObj = parseFirebaseDate(workout.scheduledFor);
      const date = formatShortDate(dateObj);
      return {
        date,
        scheduledFor: workout.scheduledFor,
        status: workout.completed
          ? "completed"
          : parseFirebaseDate(workout.scheduledFor).setHours(0, 0, 0, 0) <
              new Date().setHours(0, 0, 0, 0)
            ? "missed"
            : "not-started-yet",
        workoutType: workout.wods[0]?.name || "Workout",
        workoutId: workout.id || "",
        wods: workout.wods.map((wod, wodIndex) => ({
          id: `${workout.id || ""}-wod-${wodIndex}`,
          title: wod.name || "Untitled WOD",
          exercises: wod.exercises.map((ex) => ex.name),
        })),
      };
    });
  };

  // Split into upcoming and completed
  const { upcoming, completed, missed } = useMemo(() => {
    const upcoming = workoutSections.filter(
      (s) => s.status === "not-started-yet",
    );
    const completed = workoutSections.filter((s) => s.status === "completed");
    const missed = workoutSections.filter((s) => s.status === "missed");
    return { upcoming, completed, missed };
  }, [workoutSections]);

  // Summary stats
  const stats = useMemo(
    () => ({
      done: user?.statsSummary.completedWorkouts || 0,
      pending: upcoming.length,
      missed: missed.length,
    }),
    [workoutSections, upcoming, completed, missed],
  );

  if (loading) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <WorkoutHeader />
        <Gap size={20} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <WorkoutHeader />
        <Gap size={20} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Page>
    );
  }

  if (workoutSections.length === 0) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <WorkoutHeader />
        <Gap size={20} />
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="barbell-outline"
              size={56}
              color={Colors.primary[500]}
            />
          </View>
          <Gap size={20} />
          <Text style={styles.emptyTitle}>No Workouts Yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first workout to get started!
          </Text>
        </View>
      </Page>
    );
  }

  return (
    <Page showBackButton={false}>
      <WorkoutHeader />
      <Gap size={16} />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.warning[500] + "20" },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.warning[500]}
            />
          </View>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.success[500] + "20" },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.success[500]}
            />
          </View>
          <Text style={styles.statValue}>{stats.done}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.primary[500] + "20" },
            ]}
          >
            <Ionicons
              name="trending-down"
              size={16}
              color={Colors.primary[500]}
            />
          </View>
          <Text style={styles.statValue}>{stats.missed}</Text>
          <Text style={styles.statLabel}>Missed</Text>
        </View>
      </View>

      <Gap size={20} />

      {/* Upcoming Section */}
      {upcoming.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.warning[500]}
            />
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{upcoming.length}</Text>
            </View>
          </View>
          <Gap size={10} />
          {upcoming.map((section, index) => (
            <WorkoutSection
              key={`upcoming-${index}`}
              date={section.date}
              status={section.status}
              wods={section.wods}
              workoutType={section.workoutType}
              workoutId={section.workoutId}
            />
          ))}
          <Gap size={10} />
        </>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.success[500]}
            />
            <Text style={styles.sectionTitle}>Completed</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{completed.length}</Text>
            </View>
          </View>
          <Gap size={10} />
          {completed.map((section, index) => (
            <WorkoutSection
              key={`completed-${index}`}
              date={section.date}
              status={section.status}
              wods={section.wods}
              workoutType={section.workoutType}
              workoutId={section.workoutId}
            />
          ))}
        </>
      )}

      {/* Missed Section */}
      {missed.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="trending-down"
              size={16}
              color={Colors.primary[500]}
            />
            <Text style={styles.sectionTitle}>Missed</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{missed.length}</Text>
            </View>
          </View>
          <Gap size={10} />
          {missed.map((section, index) => (
            <WorkoutSection
              key={`missed-${index}`}
              date={section.date}
              status={section.status}
              wods={section.wods}
              workoutType={section.workoutType}
              workoutId={section.workoutId}
            />
          ))}
        </>
      )}

      {/* Load More */}
      {hasMore && (
        <>
          <Gap size={16} />
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            disabled={loadingMore}
            activeOpacity={0.75}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color={Colors.primary[500]} />
            ) : (
              <>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={Colors.primary[500]}
                />
                <Text style={styles.loadMoreText}>Load More</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
      <Gap size={24} />
    </Page>
  );
}

const styles = StyleSheet.create({
  // ── Loading / Error / Empty ──────────────────────────
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.secondary,
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
  },
  errorText: {
    color: Colors.error[500],
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    textAlign: "center",
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[500] + "15",
    borderWidth: 2,
    borderColor: Colors.primary[500] + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    textAlign: "center",
  },

  // ── Stats Row ────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.secondary[600],
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.inverse,
  },
  statLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    marginTop: -4,
  },

  // ── Section Headers ──────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    letterSpacing: 0.5,
    flex: 1,
  },
  countBadge: {
    backgroundColor: Colors.secondary[600],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },

  // ── Load More ────────────────────────────────────────
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "40",
    backgroundColor: Colors.secondary[600],
  },
  loadMoreText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
  },
});
