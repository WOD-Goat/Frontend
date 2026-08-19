import { programsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { DayWorkoutCard } from "@/components/home";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { AssignedWorkoutData, Program, ProgramWorkout } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ORANGE = Colors.primary[500];
const W62 = "rgba(255,255,255,0.62)";
const W38 = "rgba(255,255,255,0.38)";

interface DayVM {
  dayNumber: number;
  dayOfWeek: number;
  workout: ProgramWorkout | null;
  rel: "past" | "today" | "future";
}

interface WeekVM {
  week: number;
  days: DayVM[];
}

function groupByWeek(
  workouts: ProgramWorkout[],
  durationDays: number,
  currentDayNumber: number,
): WeekVM[] {
  const byDay = new Map(workouts.map((w) => [w.dayNumber, w]));
  const totalWeeks = Math.max(1, Math.ceil(durationDays / 7));
  const weeks: WeekVM[] = [];
  for (let week = 1; week <= totalWeeks; week++) {
    const days: DayVM[] = [];
    for (let dow = 1; dow <= 7; dow++) {
      const dayNumber = (week - 1) * 7 + dow;
      if (dayNumber > durationDays) break;
      const rel: DayVM["rel"] =
        dayNumber < currentDayNumber ? "past" : dayNumber === currentDayNumber ? "today" : "future";
      days.push({ dayNumber, dayOfWeek: dow, workout: byDay.get(dayNumber) ?? null, rel });
    }
    weeks.push({ week, days });
  }
  return weeks;
}

function WeekNavigator({
  week,
  totalWeeks,
  onPrev,
  onNext,
}: {
  week: number;
  totalWeeks: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const canPrev = week > 1;
  const canNext = week < totalWeeks;
  return (
    <View style={wnStyles.container}>
      <Pressable onPress={onPrev} disabled={!canPrev} hitSlop={10} style={wnStyles.chevron}>
        <Ionicons name="chevron-back" size={18} color={canPrev ? "#fff" : W38} />
      </Pressable>
      <View style={wnStyles.titleWrap}>
        <Text style={wnStyles.title}>Week {week}</Text>
      </View>
      <Pressable onPress={onNext} disabled={!canNext} hitSlop={10} style={wnStyles.chevron}>
        <Ionicons name="chevron-forward" size={18} color={canNext ? "#fff" : W38} />
      </Pressable>
    </View>
  );
}

const wnStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  chevron: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  titleWrap: { flex: 1, height: 34, alignItems: "center", justifyContent: "center" },
  title: { textAlign: "center", fontFamily: FontFamilies.spartanBold, fontSize: responsiveSize(17), color: "#fff" },
});

type ChipStatus = "completed" | "missed" | "upcoming" | "empty";

const CHIP_STATUS_DOT_COLOR: Record<ChipStatus, string> = {
  completed: Colors.success[500],
  missed: Colors.error[500],
  upcoming: Colors.primary[500],
  empty: Colors.neutral[600],
};

function getChipStatus(day: DayVM): ChipStatus {
  if (!day.workout) return "empty";
  if (day.workout.hasSubmitted) return "completed";
  if (day.rel === "past") return "missed";
  return "upcoming";
}

function DayChips({
  days,
  selectedDayNumber,
  onSelect,
}: {
  days: DayVM[];
  selectedDayNumber: number;
  onSelect: (day: DayVM) => void;
}) {
  return (
    <View style={dcStyles.row}>
      {days.map((day) => {
        const isToday = day.rel === "today";
        const isSelected = day.dayNumber === selectedDayNumber;
        const status = getChipStatus(day);
        const isRest = status === "empty";
        return (
          <Pressable
            key={day.dayNumber}
            onPress={() => onSelect(day)}
            style={[dcStyles.chip, isToday && dcStyles.chipToday, !isToday && isSelected && dcStyles.chipSelected]}
          >
            <Text
              style={[
                dcStyles.dayLabel,
                isToday && dcStyles.textWhite,
                !isToday && isSelected && dcStyles.textOrange,
              ]}
            >
              Day
            </Text>
            <Text
              style={[dcStyles.dayNum, isToday && dcStyles.textWhite, !isToday && isSelected && dcStyles.textOrange]}
            >
              {day.dayNumber}
            </Text>
            {isRest ? (
              <Text style={[dcStyles.restLabel, isToday && dcStyles.textWhite]}>REST</Text>
            ) : (
              <View style={[dcStyles.dot, { backgroundColor: isToday ? "#fff" : CHIP_STATUS_DOT_COLOR[status] }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const dcStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.secondary[700],
    borderRadius: responsiveSize(20),
    paddingHorizontal: responsiveSize(6),
    paddingVertical: responsiveSize(6),
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    gap: responsiveSize(4),
  },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: responsiveSize(8),
    paddingHorizontal: responsiveSize(2),
    borderRadius: responsiveSize(14),
    gap: responsiveSize(3),
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipToday: { backgroundColor: "#FF6A1A" },
  chipSelected: { backgroundColor: Colors.primary[500] + "18", borderColor: Colors.primary[500] },
  dayLabel: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: responsiveSize(10),
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dayNum: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(26),
    color: Colors.text.inverse,
    lineHeight: responsiveSize(28),
  },
  dot: { width: responsiveSize(6), height: responsiveSize(6), borderRadius: responsiveSize(3) },
  restLabel: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(8),
    color: Colors.text.secondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  textWhite: { color: "#FFFFFF" },
  textOrange: { color: Colors.primary[500] },
});

function toAssignedWorkoutData(workout: ProgramWorkout, program: Program, day: DayVM): AssignedWorkoutData {
  const scheduledFor = new Date();
  scheduledFor.setHours(0, 0, 0, 0);
  if (day.rel === "past") scheduledFor.setDate(scheduledFor.getDate() - 1);
  else if (day.rel === "future") scheduledFor.setDate(scheduledFor.getDate() + 1);

  return {
    id: workout.id,
    title: workout.title,
    assignedBy: "",
    groupId: null,
    programId: program.id,
    programName: program.name,
    dayNumber: workout.dayNumber,
    source: "program",
    assignedAt: scheduledFor,
    scheduledFor,
    completed: !!workout.hasSubmitted,
    hasSubmitted: workout.hasSubmitted,
    completedAt: null,
    notes: workout.notes ?? null,
    wodType: workout.wodType,
    wods: workout.wods,
    results: workout.userResult?.results ?? [],
  };
}

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [workouts, setWorkouts] = useState<ProgramWorkout[]>([]);
  const [currentDayNumber, setCurrentDayNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDow, setSelectedDow] = useState(1);
  const [leaving, setLeaving] = useState(false);

  const { showToast } = useToast();
  const globalState = useGlobalState();
  const currentUserId = globalState.get("user")?.uid ?? "";

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [programRes, workoutsRes] = await Promise.all([
        programsService.getProgramById(id),
        programsService.getProgramWorkouts(id),
      ]);
      if (programRes.success && programRes.data) setProgram(programRes.data);
      if (workoutsRes.success && workoutsRes.data) {
        setWorkouts(workoutsRes.data);
        const day = workoutsRes.currentDayNumber ?? 1;
        setCurrentDayNumber(day);
        setSelectedWeek(Math.max(1, Math.ceil(day / 7)));
        setSelectedDow(((day - 1) % 7) + 1);
      }
      if (!programRes.success) {
        showToast({ type: "error", label: programRes.message || "Program not found" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to load program" });
    } finally {
      setLoading(false);
    }
  };


  const handleLeave = () => {
    Alert.alert(
      "Leave Program",
      `Are you sure you want to leave "${program?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setLeaving(true);
              const response = await programsService.leaveProgram(id, currentUserId);
              if (response.success) {
                showToast({ type: "success", label: "You have left the program." });
                router.dismissAll();
                router.replace("/(tabs)/groups");
              } else {
                showToast({ type: "error", label: response.message || "Failed to leave program." });
              }
            } catch (err: any) {
              showToast({ type: "error", label: err.message || "Failed to leave program." });
            } finally {
              setLeaving(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <Page showBackButton={true} title="Program">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </Page>
    );
  }

  if (!program) {
    return (
      <Page showBackButton={true} title="Program">
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error[500]} />
          <Gap size={16} />
          <Text style={styles.errorText}>Program not found</Text>
        </View>
      </Page>
    );
  }

  const totalWeeks = Math.ceil(program.durationDays / 7);
  const weeks = groupByWeek(workouts, program.durationDays, currentDayNumber);
  const progressPct = Math.min(100, Math.max(0, Math.round((currentDayNumber / program.durationDays) * 100)));
  const isComplete = currentDayNumber > program.durationDays;

  const activeWeek = weeks.find((w) => w.week === selectedWeek) ?? weeks[0];
  const activeDay = activeWeek.days.find((d) => d.dayOfWeek === selectedDow) ?? activeWeek.days[activeWeek.days.length - 1];

  const initials = program.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);

  return (
    <Page showBackButton={true} scrollable={false} contentStyle={{ flex: 1, paddingBottom: 0 }}>
      <View style={styles.headerRow}>
        <View style={styles.monogram}>
          <Text style={styles.monogramText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.programName} numberOfLines={1}>
            {program.name}
          </Text>
          <Text style={styles.subLine}>
            {totalWeeks} weeks · {program.durationDays} days
          </Text>
        </View>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeave} disabled={leaving} activeOpacity={0.8}>
          <Ionicons name="exit-outline" size={14} color={Colors.error[500]} />
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>

      <Gap size={14} />

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>
            {isComplete ? "Program complete" : `Day ${currentDayNumber} of ${program.durationDays}`}
          </Text>
          <Text style={styles.progressPct}>{progressPct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
      </View>

      {program.description ? (
        <>
          <Gap size={10} />
          <Text style={styles.description}>{program.description}</Text>
        </>
      ) : null}

      <Gap size={16} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <WeekNavigator
          week={selectedWeek}
          totalWeeks={totalWeeks}
          onPrev={() => setSelectedWeek((w) => Math.max(1, w - 1))}
          onNext={() => setSelectedWeek((w) => Math.min(totalWeeks, w + 1))}
        />

        <Gap size={12} />

        <DayChips
          days={activeWeek.days}
          selectedDayNumber={activeDay.dayNumber}
          onSelect={(day) => setSelectedDow(day.dayOfWeek)}
        />

        <Gap size={14} />

        <DayWorkoutCard
          workout={activeDay.workout ? toAssignedWorkoutData(activeDay.workout, program, activeDay) : null}
          selectedDate={new Date()}
          isToday={activeDay.rel === "today"}
          showEyebrow={false}
        />

        <Gap size={120} />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: FontSizes.bodyMD, color: Colors.text.secondary },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  monogram: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  monogramText: { fontFamily: FontFamilies.poppinsBold, fontSize: responsiveSize(14), color: "#fff", letterSpacing: 0.5 },
  headerInfo: { flex: 1 },
  programName: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: responsiveSize(18), color: "#fff", lineHeight: responsiveSize(22) },
  subLine: { fontFamily: FontFamilies.poppinsRegular, fontSize: responsiveSize(11.5), color: W62, marginTop: 1 },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.error[500] + "15",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error[500] + "40",
  },
  leaveButtonText: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: responsiveSize(11), color: Colors.error[500] },
  progressCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "30",
    gap: 8,
  },
  progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: FontSizes.bodySM, color: Colors.text.primary },
  progressPct: { fontFamily: FontFamilies.spartanBold, fontSize: responsiveSize(13), color: ORANGE },
  progressTrack: { height: 5, backgroundColor: Colors.neutral[700], borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 5, backgroundColor: ORANGE, borderRadius: 3 },
  description: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    lineHeight: 19,
  },
});
