import { groupsService, workoutsService } from "@/api/services";
import {
  Gap,
  HeaderSection,
  Page,
  WorkoutSection,
  WorkoutsSkeleton,
} from "@/components";
import { useGlobalState } from "@/components/lib";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
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

const PAGE_SIZE = 7; // 1 week + today, adjust as needed

type FilterTab = "all" | "not-started-yet" | "completed" | "missed";

interface WorkoutSectionData {
  date: string;
  status: "not-started-yet" | "completed" | "missed";
  workoutId: string;
  wods: { id: string; title: string; exercises: string[] }[];
  workoutType: string;
  source?: "personal" | "group";
  groupId?: string;
  groupName?: string;
  hasSubmitted?: boolean;
  isLocked?: boolean;
  lockType?: "join" | "create";
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
  const [rawWorkouts, setRawWorkouts] = useState<AssignedWorkoutData[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set());
  const [joinedGroupsForLocking, setJoinedGroupsForLocking] = useState<
    { id: string; createdAt: any }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const globalState = useGlobalState();
  const user = globalState.get("user");
  const rawUserName = user?.nickname ?? "User";
  const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);
  const { canAccess, withinLimit, guard, guardLimit, isReady } = useFeatureGuard();

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ tabBarShowFAB: rawWorkouts.length > 0 });
  }, [rawWorkouts.length]);

  // Tab indicator animation
  const tabScales = useRef(
    TABS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.95)),
  ).current;

  // Wait for RevenueCat to initialize so canAccess/withinLimit reflect the real plan
  // before computing group lock states. isReady goes false→true exactly once.
  useEffect(() => {
    if (isReady) loadWorkouts(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

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
    cursorParam: string | null,
    isLoadMore: boolean,
  ) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      setError(null);

      // On initial load, fetch groups in parallel to determine locked group IDs
      const workoutsPromise = workoutsService.getAllWorkouts(PAGE_SIZE, cursorParam);
      const groupsPromise = !isLoadMore
        ? Promise.all([groupsService.getMyGroups(), groupsService.getMemberGroups()])
        : Promise.resolve(null);

      const [response, groupsResult] = await Promise.all([workoutsPromise, groupsPromise]);

      if (groupsResult) {
        const [myRes, memberRes] = groupsResult;
        const myGroups = myRes.success ? myRes.data ?? [] : [];
        setMyGroupIds(new Set(myGroups.map((g) => g.id).filter((id): id is string => id !== undefined)));
        const joinedGroups = (memberRes.success ? memberRes.data ?? [] : [])
          .filter((g) => g.createdBy !== user?.uid);
        setJoinedGroupsForLocking(
          joinedGroups
            .filter((g): g is typeof g & { id: string } => g.id !== undefined)
            .map((g) => ({ id: g.id, createdAt: g.createdAt })),
        );
      }
      if (response.success && response.data) {
        setRawWorkouts((prev) =>
          isLoadMore ? [...prev, ...response.data] : response.data,
        );
        if (response.nextCursor) {
          setCursor(response.nextCursor);
          setHasMore(true);
        } else {
          setCursor(null);
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
    locked: Map<string, "join" | "create"> = new Map(),
  ): WorkoutSectionData[] =>
    workouts.map((workout) => {
      const dateObj = parseFirebaseDate(workout.scheduledFor);
      return {
        date: formatShortDate(dateObj),
        status: (workout.source === "group" ? workout.hasSubmitted : workout.completed)
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
          rawText: wod.rawText ?? undefined,
        })),
        source: workout.source ?? "personal",
        groupId: workout.groupId ?? undefined,
        groupName: workout.groupName ?? undefined,
        isLocked: workout.groupId ? locked.has(workout.groupId) : false,
        lockType: workout.groupId ? locked.get(workout.groupId) : undefined,
        hasSubmitted: workout.hasSubmitted ?? false,
        wodType: workout.wodType,
        rawText: workout.rawText,
      };
    });

  // Recomputes whenever plan changes — no re-fetch needed after subscription
  const locked = useMemo(() => {
    const map = new Map<string, "join" | "create">();
    if (!canAccess("createGroup")) {
      myGroupIds.forEach((id) => map.set(id, "create"));
    }
    const sorted = [...joinedGroupsForLocking].sort((a, b) => {
      const aDate = a.createdAt ? parseFirebaseDate(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? parseFirebaseDate(b.createdAt).getTime() : 0;
      return aDate - bDate;
    });
    sorted.forEach((g, i) => {
      if (!withinLimit("groupJoinMax", i)) map.set(g.id, "join");
    });
    return map;
  }, [myGroupIds, joinedGroupsForLocking, canAccess, withinLimit]);

  const workoutSections = useMemo(
    () => transformWorkoutsToSections(rawWorkouts, locked),
    [rawWorkouts, locked],
  );

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
              size={responsiveSize(48)}
              color={Colors.primary[500]}
            />
          </View>
          <Gap size={responsiveSize(18)} />
          <Text style={styles.heroTitle}>Your training starts here</Text>
          <Text style={styles.heroSubtitle}>
            No workouts yet — let's change that. Tap the mic and describe your
            first WOD.
          </Text>
        </View>

        <Gap size={responsiveSize(24)} />

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

        <Gap size={responsiveSize(32)} />

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/workout/create")}
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
                source={section.source}
                groupId={section.groupId}
                groupName={section.groupName}
                hasSubmitted={section.hasSubmitted}
                locked={section.isLocked}
                onLockedPress={section.isLocked ? () => {
                  const dest = `/group/workout/${section.workoutId}?groupId=${section.groupId}`;
                  if (section.lockType === "create") {
                    guard("createGroup", () => router.push(dest as any));
                  } else {
                    guardLimit("groupJoinMax", Number.MAX_SAFE_INTEGER, () => router.push(dest as any));
                  }
                } : undefined}
              />
              {index < filteredSections.length - 1 && <Gap size={10} />}
            </View>
          ))}

          {hasMore && (
            <>
              <Gap size={16} />
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => loadWorkouts(cursor, true)}
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
    borderRadius: responsiveSize(24),
    padding: responsiveSize(28),
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
    width: responsiveSize(88),
    height: responsiveSize(88),
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
    lineHeight: responsiveSize(22),
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize(14),
    paddingVertical: responsiveSize(12),
    paddingHorizontal: responsiveSize(4),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700] + "60",
  },
  stepIconWrap: {
    width: responsiveSize(40),
    height: responsiveSize(40),
    borderRadius: responsiveSize(20),
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
    lineHeight: responsiveSize(18),
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize(10),
    backgroundColor: Colors.primary[500],
    borderRadius: responsiveSize(16),
    paddingVertical: responsiveSize(16),
    overflow: "hidden",
  },
  ctaGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: responsiveSize(30),
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: responsiveSize(16),
    borderTopRightRadius: responsiveSize(16),
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
