import { workoutsService } from "@/api/services";
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
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
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
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const globalState = useGlobalState();
  const user = globalState.get("user");
  const rawUserName = user?.nickname ?? "User";
  const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);
  const { isReady } = useFeatureGuard();

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

      const workoutsRes = await workoutsService.getWeekWorkouts(weekStart, weekEnd);

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
      <Page showBackButton={false} scrollable={true}>
        <HeaderSection userName={userName} streakDays={user?.statsSummary.currentStreak} weekLabel={weekLabel} />
        <Gap size={12} />

        <WeekStrip
          days={weekDays}
          selectedDate={selectedDate}
          onDaySelect={setSelectedDate}
        />
        <Gap size={24} />

        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="barbell-outline" size={responsiveSize(32)} color={Colors.primary[500]} />
          </View>
          <Gap size={responsiveSize(16)} />
          <Text style={styles.emptyTitle}>No workouts this week</Text>
          <Text style={styles.emptySubtext}>
            You're not following a program right now. Join a group to get coached workouts — or log your own training.
          </Text>
          <Gap size={responsiveSize(20)} />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/groups")}
            activeOpacity={0.85}
          >
            <Ionicons name="people-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Join a group</Text>
          </TouchableOpacity>

          <Gap size={responsiveSize(10)} />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/workout/create")}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color={Colors.text.primary} />
            <Text style={styles.secondaryButtonText}>Log a workout</Text>
          </TouchableOpacity>
        </View>

        <Gap size={responsiveSize(20)} />
        <Text style={styles.emptyFooter}>
          Workouts your coach programs will show up here automatically.
        </Text>
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
  emptyCard: {
    backgroundColor: Colors.secondary[700],
    borderRadius: responsiveSize(24),
    padding: responsiveSize(28),
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  emptyIconWrap: {
    width: responsiveSize(72),
    height: responsiveSize(72),
    borderRadius: responsiveSize(18),
    backgroundColor: Colors.secondary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize(8),
    backgroundColor: Colors.primary[500],
    borderRadius: responsiveSize(14),
    paddingVertical: responsiveSize(14),
    width: "100%",
  },
  primaryButtonText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodyMD,
    color: "#fff",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize(8),
    backgroundColor: Colors.secondary[600],
    borderRadius: responsiveSize(14),
    paddingVertical: responsiveSize(14),
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  secondaryButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  emptyFooter: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: responsiveSize(18),
    paddingHorizontal: responsiveSize(16),
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: FontFamilies.spartanRegular,
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
