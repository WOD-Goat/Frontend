import { workoutsService } from "@/api/services";
import {
  Gap,
  HeaderSection,
  Page,
  WorkoutSection,
  WorkoutsSkeleton,
} from "@/components";
import { useGlobalState } from "@/components/lib";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { AssignedWorkoutData } from "@/types";
import { formatShortDate, parseFirebaseDate } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_SIZE = 14; // 2 weeks + today, adjust as needed

type FilterTab = "all" | "not-started-yet" | "completed" | "missed";

interface WorkoutSectionData {
  date: string;
  status: "not-started-yet" | "completed" | "missed";
  workoutId: string;
  wods: { id: string; title: string; exercises: string[] }[];
  workoutType: string;
}

const TABS: { key: FilterTab; label: string; color: string; icon: any }[] = [
  { key: "all", label: "All", color: Colors.primary[500], icon: "apps" },
  {
    key: "not-started-yet",
    label: "Upcoming",
    color: Colors.primary[500],
    icon: "time-outline",
  },
  {
    key: "completed",
    label: "Done",
    color: Colors.primary[500],
    icon: "checkmark-circle",
  },
  {
    key: "missed",
    label: "Missed",
    color: Colors.primary[500],
    icon: "trending-down",
  },
];

export default function WorkoutsScreen() {
  const [workoutSections, setWorkoutSections] = useState<WorkoutSectionData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startAfter, setStartAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const globalState = useGlobalState();
  const user = globalState.get("user");
  const rawUserName = user?.nickname ?? "User";
  const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ tabBarShowFAB: workoutSections.length > 0 });
  }, [workoutSections.length]);

  // Tab indicator animation
  const tabScales = useRef(
    TABS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.95)),
  ).current;

  useEffect(() => {
    loadWorkouts(null, false);
  }, []);

  const handleTabPress = (key: FilterTab, index: number) => {
    setActiveTab(key);
    TABS.forEach((_, i) => {
      Animated.spring(tabScales[i], {
        toValue: i === index ? 1 : 0.95,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    });
  };

  const loadWorkouts = async (
    startAfter: string | null,
    isLoadMore: boolean,
  ) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      setError(null);
      const response = await workoutsService.getAllWorkouts(
        PAGE_SIZE,
        startAfter,
      );
      if (response.success && response.data) {
        const newSections = transformWorkoutsToSections(response.data);
        setWorkoutSections((prev) =>
          isLoadMore ? [...prev, ...newSections] : newSections,
        );
        if (response.data.length >= PAGE_SIZE) {
          const last = response.data[response.data.length - 1];
          setStartAfter(parseFirebaseDate(last.scheduledFor).toISOString());
          setHasMore(true);
        } else {
          setStartAfter(null);
          setHasMore(false);
        }
      } else {
        setError(response.message || "Failed to load workouts");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load workouts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const transformWorkoutsToSections = (
    workouts: AssignedWorkoutData[],
  ): WorkoutSectionData[] =>
    workouts.map((workout) => {
      const dateObj = parseFirebaseDate(workout.scheduledFor);
      return {
        date: formatShortDate(dateObj),
        status: workout.completed
          ? "completed"
          : dateObj.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
            ? "missed"
            : "not-started-yet",
        workoutType: workout.wods[0]?.name || "Workout",
        workoutId: workout.id || "",
        wods: workout.wods.map((wod, i) => ({
          id: `${workout.id || ""}-wod-${i}`,
          title: wod.name || "Untitled WOD",
          exercises: wod.exercises.map((ex) => ex.name),
        })),
      };
    });

  const counts = useMemo(
    () => ({
      upcoming: workoutSections.filter((s) => s.status === "not-started-yet")
        .length,
      completed: workoutSections.filter((s) => s.status === "completed").length,
      missed: workoutSections.filter((s) => s.status === "missed").length,
    }),
    [workoutSections],
  );

  const filteredSections = useMemo(
    () =>
      activeTab === "all"
        ? workoutSections
        : workoutSections.filter((s) => s.status === activeTab),
    [workoutSections, activeTab],
  );


  if (loading) return <WorkoutsSkeleton userName={userName} user={user} />;

  if (error) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <HeaderSection
          userName={userName}
          streakDays={user?.statsSummary.currentStreak}
        />
        <Gap size={20} />
        <View style={styles.centerContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={52}
            color={Colors.error[500]}
          />
          <Gap size={16} />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <Gap size={20} />
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadWorkouts(null, false)}
          >
            <Ionicons name="refresh" size={16} color={Colors.primary[500]} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
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
        <HeaderSection
          userName={userName}
          streakDays={user?.statsSummary.currentStreak}
        />
        <Gap size={8} />

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIconRing}>
            <Ionicons
              name="barbell-outline"
              size={48}
              color={Colors.primary[500]}
            />
          </View>
          <Gap size={18} />
          <Text style={styles.heroTitle}>Your training starts here</Text>
          <Text style={styles.heroSubtitle}>
            No workouts yet — let's change that. Tap the mic and describe your
            first WOD.
          </Text>
        </View>

        <Gap size={24} />

        {/* How it works steps */}
        {(
          [
            {
              icon: "mic-outline",
              label: "Speak your workout",
              desc: "Describe it naturally — reps, rounds, exercises",
            },
            {
              icon: "flash-outline",
              label: "AI structures it",
              desc: "We turn your words into a proper WOD instantly",
            },
            {
              icon: "trophy-outline",
              label: "Log & track progress",
              desc: "Every PR and streak automatically recorded",
            },
          ] as const
        ).map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              <Ionicons
                name={step.icon}
                size={18}
                color={Colors.primary[500]}
              />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        <Gap size={32} />

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/workout/create?voice=true")}
          activeOpacity={0.85}
        >
          <View style={styles.ctaGlow} />
          <Ionicons name="mic" size={20} color="#0D0D14" />
          <Text style={styles.ctaText}>Create My First Workout</Text>
        </TouchableOpacity>
      </Page>
    );
  }

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  return (
    <Page showBackButton={false}>
      {/* Greeting */}
      <HeaderSection
        userName={userName}
        streakDays={user?.statsSummary.currentStreak}
      />
      <Gap size={10} />
      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.warning[500] }]}>
            {counts.upcoming}
          </Text>
          <Text style={styles.statLbl}>Upcoming</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.success[500] }]}>
            {user?.statsSummary.completedWorkouts ?? counts.completed}
          </Text>
          <Text style={styles.statLbl}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.error[500] }]}>
            {counts.missed}
          </Text>
          <Text style={styles.statLbl}>Missed</Text>
        </View>
      </View>

      <Gap size={20} />

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {TABS.map((tab, i) => {
          const isActive = activeTab === tab.key;
          return (
            <Animated.View
              key={tab.key}
              style={{ transform: [{ scale: tabScales[i] }] }}
            >
              <Pressable
                onPress={() => handleTabPress(tab.key, i)}
                style={[
                  styles.tab,
                  isActive && {
                    backgroundColor: tab.color + "20",
                    borderColor: tab.color + "60",
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={13}
                  color={isActive ? tab.color : Colors.text.secondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? tab.color : Colors.text.secondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      <Gap size={16} />

      {/* Empty filter state */}
      {filteredSections.length === 0 ? (
        <View
          style={[styles.centerContainer, { flex: 0, paddingVertical: 40 }]}
        >
          <Ionicons
            name={activeTabConfig.icon}
            size={40}
            color={activeTabConfig.color + "60"}
          />
          <Gap size={12} />
          <Text style={styles.emptyTitle}>
            No {activeTabConfig.label} Workouts
          </Text>
        </View>
      ) : (
        <>
          {filteredSections.map((section, index) => (
            <View key={`${activeTab}-${index}`}>
              <WorkoutSection
                date={section.date}
                status={section.status}
                wods={section.wods}
                workoutType={section.workoutType}
                workoutId={section.workoutId}
              />
              {index < filteredSections.length - 1 && <Gap size={10} />}
            </View>
          ))}

          {hasMore && (
            <>
              <Gap size={16} />
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => loadWorkouts(startAfter, true)}
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
        </>
      )}

      <Gap size={160} />
    </Page>
  );
}

const styles = StyleSheet.create({
  // ── Onboarding empty state ─────────────────────────────
  heroCard: {
    backgroundColor: Colors.secondary[600],
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "25",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary[500] + "18",
  },
  heroIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary[500] + "15",
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700] + "60",
  },
  stepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[500] + "15",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepTextWrap: {
    flex: 1,
  },
  stepLabel: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary[500],
    borderRadius: 16,
    paddingVertical: 16,
    overflow: "hidden",
  },
  ctaGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  ctaText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodyMD,
    color: "#0D0D14",
  },

  // ── Error / filter-empty states ────────────────────────
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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

  // ── Stats strip ────────────────────────────────────────
  statsStrip: {
    flexDirection: "row",
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.heading2XL,
    lineHeight: FontSizes.heading2XL * 1.15,
  },
  statLbl: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
    backgroundColor: Colors.neutral[700],
  },

  // ── Filter tabs ────────────────────────────────────────
  tabsContainer: {
    gap: 8,
    paddingHorizontal: 2,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: Colors.secondary[600],
  },
  tabLabel: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
  },

  // ── Load more ──────────────────────────────────────────
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
