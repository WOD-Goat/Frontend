import { groupsService, workoutsService } from "@/api/services";
import {
  DayWorkoutCard,
  Gap,
  HeaderSection,
  MakeupCallout,
  Page,
  WeekDayCell,
  WeekStrip,
  WorkoutsSkeleton,
} from "@/components";
import { useGlobalState } from "@/components/lib";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
import type { AssignedWorkoutData } from "@/types";
import {
  getWeekDays,
  getWeekEnd,
  getWeekLabel,
  getWeekStart,
  isSameDay,
  parseFirebaseDate,
} from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WorkoutsScreen() {
  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => getWeekStart(today), [today]);
  const weekEnd = useMemo(() => getWeekEnd(today), [today]);
  const weekLabel = useMemo(() => getWeekLabel(today), [today]);

  const [weekWorkouts, setWeekWorkouts] = useState<AssignedWorkoutData[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set());
  const [joinedGroupsForLocking, setJoinedGroupsForLocking] = useState<
    { id: string; createdAt: any }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const globalState = useGlobalState();
  const user = globalState.get("user");
  const rawUserName = user?.nickname ?? "User";
  const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);
  const { canAccess, withinLimit, isReady } = useFeatureGuard();

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ tabBarShowFAB: weekWorkouts.length > 0 });
  }, [weekWorkouts.length]);

  useEffect(() => {
    if (isReady) loadWeek();
  }, [isReady]);

  const loadWeek = async () => {
    try {
      setLoading(true);
      setError(null);

      const [workoutsRes, groupsResult] = await Promise.all([
        workoutsService.getWeekWorkouts(weekStart, weekEnd),
        Promise.all([groupsService.getMyGroups(), groupsService.getMemberGroups()]),
      ]);

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

      if (workoutsRes.success && workoutsRes.data) {
        setWeekWorkouts(workoutsRes.data);
      } else {
        setError(workoutsRes.message || "Failed to load workouts");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

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

  const workoutStatus = (workout: AssignedWorkoutData): "completed" | "missed" | "not-started-yet" => {
    const done = workout.source === "group" ? workout.hasSubmitted : workout.completed;
    if (done) return "completed";
    const scheduled = parseFirebaseDate(workout.scheduledFor);
    if (scheduled.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) return "missed";
    return "not-started-yet";
  };

  const weekDays: WeekDayCell[] = useMemo(() => {
    return getWeekDays(today).map((d) => {
      const match = weekWorkouts.find((w) => isSameDay(parseFirebaseDate(w.scheduledFor), d));
      let status: WeekDayCell["status"] = "empty";
      if (match) {
        const s = workoutStatus(match);
        status = s === "not-started-yet" ? "upcoming" : s;
      }
      return { date: d, status, isToday: isSameDay(d, today) };
    });
  }, [weekWorkouts, today]);

  const selectedWorkouts = useMemo(
    () => weekWorkouts.filter((w) => isSameDay(parseFirebaseDate(w.scheduledFor), selectedDate)),
    [weekWorkouts, selectedDate],
  );

  const missedWorkouts = useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    return weekWorkouts
      .filter((w) => {
        const scheduled = parseFirebaseDate(w.scheduledFor);
        return (
          scheduled.setHours(0, 0, 0, 0) < todayMidnight.getTime() &&
          workoutStatus(w) === "missed" &&
          !isSameDay(parseFirebaseDate(w.scheduledFor), selectedDate)
        );
      })
      .sort((a, b) =>
        parseFirebaseDate(a.scheduledFor).getTime() - parseFirebaseDate(b.scheduledFor).getTime()
      );
  }, [weekWorkouts, selectedDate]);

  const isToday = isSameDay(selectedDate, today);

  if (loading) return <WorkoutsSkeleton userName={userName} user={user} />;

  if (error) {
    return (
      <Page showBackButton={false} contentStyle={{ flex: 1 }} scrollable={false}>
        <HeaderSection userName={userName} streakDays={user?.statsSummary.currentStreak} weekLabel={weekLabel} />
        <Gap size={20} />
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={52} color={Colors.error[500]} />
          <Gap size={16} />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <Gap size={20} />
          <TouchableOpacity style={styles.retryButton} onPress={loadWeek}>
            <Ionicons name="refresh" size={16} color={Colors.primary[500]} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Page>
    );
  }

  if (weekWorkouts.length === 0) {
    return (
      <Page showBackButton={false} contentStyle={{ flex: 1 }} scrollable={true}>
        <HeaderSection userName={userName} streakDays={user?.statsSummary.currentStreak} weekLabel={weekLabel} />
        <Gap size={8} />

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIconRing}>
            <Ionicons name="barbell-outline" size={responsiveSize(48)} color={Colors.primary[500]} />
          </View>
          <Gap size={responsiveSize(18)} />
          <Text style={styles.heroTitle}>Your training starts here</Text>
          <Text style={styles.heroSubtitle}>
            No workouts yet — let's change that. Tap the mic and describe your first WOD.
          </Text>
        </View>

        <Gap size={responsiveSize(24)} />

        {(
          [
            { icon: "mic-outline", label: "Speak your workout", desc: "Describe it naturally — reps, rounds, exercises" },
            { icon: "flash-outline", label: "AI structures it", desc: "We turn your words into a proper WOD instantly" },
            { icon: "trophy-outline", label: "Log & track progress", desc: "Every PR and streak automatically recorded" },
          ] as const
        ).map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              <Ionicons name={step.icon} size={18} color={Colors.primary[500]} />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        <Gap size={responsiveSize(32)} />

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

  return (
    <Page showBackButton={false} scrollRef={scrollRef}>
      <HeaderSection
        userName={userName}
        streakDays={user?.statsSummary.currentStreak}
        weekLabel={weekLabel}
      />
      <Gap size={12} />

      <WeekStrip
        days={weekDays}
        selectedDate={selectedDate}
        onDaySelect={setSelectedDate}
      />
      <Gap size={16} />

      {selectedWorkouts.length === 0 ? (
        <DayWorkoutCard workout={null} selectedDate={selectedDate} isToday={isToday} />
      ) : (
        selectedWorkouts.map((w, i) => (
          <View key={w.id ?? i}>
            {i > 0 && <Gap size={12} />}
            <DayWorkoutCard
              workout={w}
              selectedDate={selectedDate}
              isToday={isToday}
              showEyebrow={i === 0}
            />
          </View>
        ))
      )}

      {missedWorkouts.length > 0 && (
        <>
          <Gap size={20} />
          <Text style={styles.sectionTitle}>Missed Workouts</Text>
          <Gap size={10} />
          {missedWorkouts.map((w) => (
            <View key={w.id ?? w.scheduledFor.toString()}>
              <MakeupCallout
                workout={w}
                onPress={() => {
                  setSelectedDate(parseFirebaseDate(w.scheduledFor));
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
              />
              <Gap size={8} />
            </View>
          ))}
        </>
      )}

      <Gap size={160} />
    </Page>
  );
}

const styles = StyleSheet.create({
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
  stepTextWrap: { flex: 1 },
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
  sectionTitle: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
