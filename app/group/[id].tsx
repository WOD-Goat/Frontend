import { groupsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { GroupMember, GroupWithMembers, GroupWorkout } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { getWeekDays, isSameDay, parseFirebaseDate } from "@/utils";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── design tokens ────────────────────────────────────────────────────────────
const ORANGE = Colors.primary[500];
const W62 = "rgba(255,255,255,0.62)";
const W38 = "rgba(255,255,255,0.38)";
const W8  = "rgba(255,255,255,0.08)";
const W5  = "rgba(255,255,255,0.05)";

type DetailTab = "workouts" | "past" | "athletes";

// ── DayVM ────────────────────────────────────────────────────────────────────
interface DayVM {
  id: string;
  weekday: string;
  dateNum: number;
  rel: "past" | "today" | "future";
  title: string;
  wodCount: number;
  wods: { kind: string; body: string }[];
  hasWorkouts: boolean;
  workoutId: string | null;
}

// ── WodLine ──────────────────────────────────────────────────────────────────
function WodLine({ wod, index }: { wod: { kind: string; body: string }; index: number }) {
  return (
    <View style={[wodStyles.row, index > 0 && wodStyles.divider]}>
      <Text style={wodStyles.idx}>{String(index + 1).padStart(2, "0")}</Text>
      <View style={wodStyles.body}>
        <Text style={wodStyles.kind}>{wod.kind}</Text>
        {!!wod.body && <Text style={wodStyles.prescription}>{wod.body}</Text>}
      </View>
    </View>
  );
}

const wodStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingVertical: 8 },
  divider: { borderTopWidth: 1, borderTopColor: W8 },
  idx: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(12),
    color: ORANGE,
    minWidth: 20,
    lineHeight: responsiveSize(18),
  },
  body: { flex: 1, gap: 2 },
  kind: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(12.5),
    color: "#fff",
  },
  prescription: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(12),
    color: W62,
    lineHeight: responsiveSize(12) * 1.5,
  },
});

// ── DayRow ──────────────────────────────────────────────────────────────────
function DayRow({
  day,
  isOpen,
  isLast,
  onToggle,
  reduceMotion,
  groupId,
}: {
  day: DayVM;
  isOpen: boolean;
  isLast: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
  groupId: string;
}) {
  const chevAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) { chevAnim.setValue(isOpen ? 1 : 0); return; }
    Animated.timing(chevAnim, { toValue: isOpen ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [isOpen]);

  const chevRotate = chevAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  const isToday = day.rel === "today";
  const isPast  = day.rel === "past";

  return (
    <View style={drStyles.outer}>
      {/* left rail */}
      <View style={drStyles.rail}>
        <View style={[drStyles.node, isToday ? drStyles.nodeToday : drStyles.nodeOther]}>
          <Text style={[drStyles.nodeWd, isToday && { color: "#fff" }]}>{day.weekday}</Text>
          <Text style={[drStyles.nodeDay, isToday && { color: "#fff" }]}>{day.dateNum}</Text>
        </View>
        {!isLast && <View style={drStyles.connector} pointerEvents="none" />}
      </View>

      {/* right content */}
      <View style={[drStyles.right, isPast && { opacity: 0.82 }]}>
        {!day.hasWorkouts ? (
          <View style={drStyles.restRow}>
            <Text style={drStyles.restText}>No Workouts / Rest Day</Text>
          </View>
        ) : (
          <>
            <View style={drStyles.headerWrap}>
              <Pressable onPress={onToggle} style={drStyles.headerBtn}>
                <View style={drStyles.headerTopRow}>
                  <Text style={drStyles.headerTitle} numberOfLines={1}>{day.title}</Text>
                  <View style={drStyles.headerActions}>
                    {isToday && (
                      <View style={drStyles.todayBadge}>
                        <Text style={drStyles.todayBadgeText}>Today</Text>
                      </View>
                    )}
                    <Animated.View style={{ transform: [{ rotate: chevRotate }], alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="chevron-down" size={15} color={W62} />
                    </Animated.View>
                  </View>
                </View>
                <Text style={drStyles.meta}>
                  {day.wodCount} WOD{day.wodCount !== 1 ? "s" : ""}
                </Text>
              </Pressable>
            </View>

            {isOpen && day.wods.length > 0 && (
              <Pressable
                style={[drStyles.panel, isToday ? drStyles.panelToday : drStyles.panelOther]}
                onPress={() => day.workoutId && router.push(`/group/workout/${day.workoutId}?groupId=${groupId}`)}
              >
                {day.wods.map((w, i) => <WodLine key={i} wod={w} index={i} />)}
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const drStyles = StyleSheet.create({
  outer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  rail: { width: 46, alignItems: "center" },
  node: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  nodeToday: { backgroundColor: ORANGE },
  nodeOther: { backgroundColor: W5, borderWidth: 1, borderColor: W8 },
  nodeWd: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: responsiveSize(11),
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    lineHeight: responsiveSize(13),
  },
  nodeDay: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(22),
    color: Colors.text.inverse,
    lineHeight: responsiveSize(24),
  },
  connector: {
    position: "absolute",
    top: 46,
    bottom: -20,
    left: 21.5,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  right: { flex: 1, paddingBottom: 8 },
  restRow: { minHeight: 46, justifyContent: "center" },
  restText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(17),
    color: W62,
    letterSpacing: -0.3,
  },
  headerWrap: { minHeight: 46, justifyContent: "center" },
  headerBtn: { gap: 1 },
  headerTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(17),
    color: "#fff",
    letterSpacing: -0.3,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  todayBadge: {
    backgroundColor: "rgba(255,106,26,0.14)",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  todayBadgeText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(10.5),
    color: ORANGE,
    letterSpacing: 0.5,
  },
  meta: { fontFamily: FontFamilies.poppinsRegular, fontSize: responsiveSize(11), color: W38 },
  panel: { borderRadius: 13, paddingHorizontal: 13, paddingTop: 3, paddingBottom: 10, marginTop: 6, borderWidth: 1 },
  panelToday: { backgroundColor: "#1c1510", borderColor: "rgba(255,106,26,0.42)" },
  panelOther: { backgroundColor: "rgba(255,255,255,0.025)", borderColor: W8 },
});

// ── WeekTimelineView ─────────────────────────────────────────────────────────
function WeekTimelineView({
  weekWorkouts,
  loading,
  groupId,
  isAdmin,
  coachName,
}: {
  weekWorkouts: GroupWorkout[];
  loading: boolean;
  groupId: string;
  isAdmin: boolean;
  coachName: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = getWeekDays(today);
  const DAY_ABBRS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const localKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const dayMap: Record<string, GroupWorkout[]> = {};
  weekWorkouts.forEach((w) => {
    const d = parseFirebaseDate(w.scheduledFor);
    d.setHours(0, 0, 0, 0);
    const key = localKey(d);
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(w);
  });

  const dayVMs: DayVM[] = weekDays.map((d) => {
    const key = localKey(d);
    const dayWorkouts = dayMap[key] ?? [];
    const dTime = d.getTime();
    const rel: DayVM["rel"] =
      dTime < today.getTime() ? "past" : dTime === today.getTime() ? "today" : "future";

    const allWods = dayWorkouts.flatMap((w) =>
      w.wods.map((wod) => ({ kind: wod.name, body: wod.rawText ?? "" }))
    );
    const primaryTitle = dayWorkouts[0]?.title ?? null;

    return {
      id: key,
      weekday: DAY_ABBRS[d.getDay()],
      dateNum: d.getDate(),
      rel,
      title: primaryTitle || `${DAY_ABBRS[d.getDay()]} Workout`,
      wodCount: allWods.length,
      wods: allWods,
      hasWorkouts: dayWorkouts.length > 0,
      workoutId: dayWorkouts[0]?.id ?? null,
    };
  });

  const initialOpen: Record<string, boolean> = {};
  dayVMs.forEach((d) => { initialOpen[d.id] = d.rel !== "past"; });

  const [openByDay, setOpenByDay] = useState<Record<string, boolean>>(initialOpen);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  const daysWithWorkouts = dayVMs.filter((d) => d.hasWorkouts);
  const allExpanded =
    daysWithWorkouts.length > 0 && daysWithWorkouts.every((d) => openByDay[d.id]);

  const expandAnim = useRef(new Animated.Value(allExpanded ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) { expandAnim.setValue(allExpanded ? 1 : 0); return; }
    Animated.timing(expandAnim, { toValue: allExpanded ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [allExpanded]);

  const expandRotate = expandAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  const toggleDay = (id: string) =>
    setOpenByDay((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const next = !allExpanded;
    const newState: Record<string, boolean> = {};
    dayVMs.forEach((d) => { newState[d.id] = next; });
    setOpenByDay(newState);
  };

  const totalWods = dayVMs.reduce((acc, d) => acc + d.wodCount, 0);

  if (loading) {
    return (
      <View style={tlStyles.loadingWrap}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  if (weekWorkouts.length === 0) {
    return (
      <View>
        <Text style={tlStyles.thisWeekLabel}>THIS WEEK</Text>
        <Gap size={14} />
        <View style={tlStyles.emptyCard}>
          <View style={tlStyles.emptyIconWrap}>
            <Ionicons
              name={isAdmin ? "calendar-outline" : "document-text-outline"}
              size={responsiveSize(30)}
              color={ORANGE}
            />
          </View>
          <Gap size={responsiveSize(16)} />
          <Text style={tlStyles.emptyCardTitle}>
            {isAdmin ? "Program your first workout" : "No workouts yet"}
          </Text>
          <Text style={tlStyles.emptyCardSubtext}>
            {isAdmin
              ? "This group is ready for training. Add a workout so your athletes know what to do."
              : `${coachName} hasn't programmed anything for this group yet. You'll be notified the moment they do.`}
          </Text>
          <Gap size={responsiveSize(20)} />
          {isAdmin ? (
            <TouchableOpacity
              style={tlStyles.emptyPrimaryBtn}
              onPress={() => router.push(`/group/workout/create?groupId=${groupId}`)}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={tlStyles.emptyPrimaryBtnText}>Add a workout</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={tlStyles.emptySecondaryBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="notifications-outline" size={16} color={W62} />
              <Text style={tlStyles.emptySecondaryBtnText}>Notify me when posted</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View>
      {/* Toolbar */}
      <View style={tlStyles.toolbar}>
        <View style={tlStyles.toolbarLeft}>
          <Text style={tlStyles.thisWeek}>THIS WEEK</Text>
          <View style={tlStyles.countChip}>
            <Text style={tlStyles.countChipText}>
              7 days · {totalWods} WOD{totalWods !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={tlStyles.expandBtn} onPress={toggleAll} activeOpacity={0.75}>
          <Animated.View style={[tlStyles.doubleChevronWrap, { transform: [{ rotate: expandRotate }] }]}>
            <Ionicons name="chevron-down" size={11} color={W62} style={{ marginBottom: -5 }} />
            <Ionicons name="chevron-down" size={11} color={W62} />
          </Animated.View>
          <Text style={tlStyles.expandBtnText}>{allExpanded ? "Collapse all" : "Expand all"}</Text>
        </TouchableOpacity>
      </View>

      <Gap size={14} />

      {/* Timeline */}
      {dayVMs.map((day, i) => (
        <DayRow
          key={day.id}
          day={day}
          isOpen={openByDay[day.id] ?? false}
          isLast={i === dayVMs.length - 1}
          onToggle={() => toggleDay(day.id)}
          reduceMotion={reduceMotion}
          groupId={groupId}
        />
      ))}
    </View>
  );
}

const tlStyles = StyleSheet.create({
  loadingWrap: { paddingTop: 40, alignItems: "center" },
  emptyCard: {
    backgroundColor: W5,
    borderRadius: responsiveSize(20),
    borderWidth: 1,
    borderColor: W8,
    padding: responsiveSize(28),
    alignItems: "center",
  },
  emptyIconWrap: {
    width: responsiveSize(68),
    height: responsiveSize(68),
    borderRadius: responsiveSize(18),
    backgroundColor: ORANGE + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCardTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(20),
    color: "#fff",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptyCardSubtext: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(13.5),
    color: W62,
    textAlign: "center",
    lineHeight: responsiveSize(20),
    paddingHorizontal: responsiveSize(4),
    marginTop: responsiveSize(6),
  },
  emptyPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize(8),
    backgroundColor: ORANGE,
    borderRadius: responsiveSize(14),
    paddingVertical: responsiveSize(14),
    width: "100%",
  },
  emptyPrimaryBtnText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodyMD,
    color: "#fff",
  },
  emptySecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize(8),
    backgroundColor: W8,
    borderRadius: responsiveSize(14),
    paddingVertical: responsiveSize(14),
    paddingHorizontal: responsiveSize(20),
    borderWidth: 1,
    borderColor: W8,
  },
  emptySecondaryBtnText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: W62,
  },
  thisWeekLabel: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(13),
    color: "#fff",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  toolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toolbarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  thisWeek: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(13),
    color: "#fff",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  countChip: {
    backgroundColor: W5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countChipText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(12),
    color: W38,
  },
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: W5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  doubleChevronWrap: { alignItems: "center" },
  expandBtnText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
    color: W62,
  },
});

// ── WorkoutItem (past tab) ───────────────────────────────────────────────────
function WorkoutItem({ workout, groupId, isAdmin }: { workout: GroupWorkout; groupId: string; isAdmin: boolean }) {
  const date = parseFirebaseDate(workout.scheduledFor);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateDay = new Date(date);
  dateDay.setHours(0, 0, 0, 0);
  const isPast = dateDay < today;
  const isToday = isSameDay(dateDay, today);

  const status = workout.hasSubmitted
    ? { label: "Done", color: Colors.success[500], icon: "checkmark-circle" as const }
    : isToday
    ? { label: "Today", color: Colors.primary[500], icon: "time-outline" as const }
    : isPast
    ? { label: "Missed", color: Colors.error[500], icon: "close-circle-outline" as const }
    : { label: "Upcoming", color: Colors.primary[500], icon: "calendar-outline" as const };

  return (
    <Pressable
      style={styles.workoutItem}
      onPress={() => router.push(`/group/workout/${workout.id}?groupId=${groupId}`)}
    >
      <View style={[styles.workoutItemIconWrap, { backgroundColor: status.color + "18", borderColor: status.color + "40" }]}>
        <Ionicons name="barbell-outline" size={20} color={status.color} />
      </View>
      <View style={styles.workoutItemBody}>
        <Text style={styles.workoutItemTitle} numberOfLines={1}>
          {workout.title || "Group Workout"}
        </Text>
        <View style={styles.workoutItemMeta}>
          <Ionicons name="calendar-outline" size={11} color={Colors.text.secondary} />
          <Text style={styles.workoutItemMetaText}>
            {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </Text>
          <Text style={styles.workoutItemDot}>·</Text>
          <Ionicons name="layers-outline" size={11} color={Colors.text.secondary} />
          <Text style={styles.workoutItemMetaText}>
            {workout.wods.length} WOD{workout.wods.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
      {isAdmin && workout.submittedCount != null && workout.totalMembers != null ? (
        <View style={styles.submissionBadge}>
          <Ionicons name="people-outline" size={11} color={Colors.text.secondary} />
          <Text style={styles.submissionBadgeText}>
            {workout.submittedCount}/{workout.totalMembers}
          </Text>
        </View>
      ) : (
        <View style={[styles.workoutStatusBadge, { backgroundColor: status.color + "18" }]}>
          <Ionicons name={status.icon} size={11} color={status.color} />
          <Text style={[styles.workoutStatusText, { color: status.color }]}>{status.label}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── MemberItem ───────────────────────────────────────────────────────────────
function MemberItem({ member, groupId, isAdmin }: { member: GroupMember; groupId: string; isAdmin: boolean }) {
  const initials = (member.name ?? member.nickname ?? "?")[0].toUpperCase();
  return (
    <Pressable
      style={styles.memberItem}
      onPress={() =>
        isAdmin && !member.isAdmin
          ? router.push(`/group/member/${member.uid}?groupId=${groupId}`)
          : undefined
      }
    >
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{initials}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name || member.nickname}</Text>
        {member.nickname && <Text style={styles.memberNickname}>@{member.nickname}</Text>}
      </View>
      {member.isAdmin ? (
        <View style={styles.adminBadge}>
          <Ionicons name="star" size={10} color={Colors.primary[500]} />
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      ) : isAdmin ? (
        <Ionicons name="chevron-forward" size={16} color={Colors.neutral[600]} />
      ) : null}
    </Pressable>
  );
}

// ── GroupDetailScreen ────────────────────────────────────────────────────────
const PAST_PAGE_SIZE = 20;

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup]                 = useState<GroupWithMembers | null>(null);
  const [weekWorkouts, setWeekWorkouts]   = useState<GroupWorkout[]>([]);
  const [loadingWeek, setLoadingWeek]     = useState(true);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState<DetailTab>("workouts");
  const [regenerating, setRegenerating]   = useState(false);
  const [pastWorkouts, setPastWorkouts]   = useState<GroupWorkout[]>([]);
  const [pastCursor, setPastCursor]       = useState<string | null>(null);
  const [pastHasMore, setPastHasMore]     = useState(false);
  const [loadingPast, setLoadingPast]     = useState(false);
  const [loadingMorePast, setLoadingMorePast] = useState(false);
  const [pastLoaded, setPastLoaded]       = useState(false);

  const { showToast } = useToast();
  const globalState = useGlobalState();
  const currentUserId = globalState.get("user")?.uid ?? "";

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingWeek(true);
      const [groupRes, weekRes] = await Promise.all([
        groupsService.getGroupById(id),
        groupsService.getGroupWeekWorkouts(id),
      ]);
      if (groupRes.success && groupRes.data) setGroup(groupRes.data);
      if (weekRes.success && weekRes.data)   setWeekWorkouts(weekRes.data);
      if (!groupRes.success) {
        showToast({ type: "error", label: groupRes.message || "Group not found" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to load group" });
    } finally {
      setLoading(false);
      setLoadingWeek(false);
    }
  };

  const loadPastWorkouts = async (cursorParam: string | null, isLoadMore: boolean) => {
    try {
      isLoadMore ? setLoadingMorePast(true) : setLoadingPast(true);
      const res = await groupsService.getGroupWorkoutHistory(id, PAST_PAGE_SIZE, cursorParam);
      if (res.success && res.data) {
        setPastWorkouts((prev) => (isLoadMore ? [...prev, ...res.data] : res.data));
        setPastCursor(res.nextCursor ?? null);
        setPastHasMore(!!res.nextCursor);
      } else {
        showToast({ type: "error", label: res.message || "Failed to load history" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to load history" });
    } finally {
      setLoadingPast(false);
      setLoadingMorePast(false);
      setPastLoaded(true);
    }
  };

  const handleTabChange = (tab: DetailTab) => {
    setActiveTab(tab);
    if (tab === "past" && !pastLoaded) loadPastWorkouts(null, false);
  };

  const handleRegenerateCode = async () => {
    try {
      setRegenerating(true);
      const response = await groupsService.regenerateCode(id);
      if (response.success && response.data) {
        setGroup((prev) => (prev ? { ...prev, joinCode: response.data.joinCode } : prev));
        showToast({ type: "success", label: "New join code generated!" });
      } else {
        showToast({ type: "error", label: response.message || "Failed to regenerate code" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to regenerate code" });
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!group?.joinCode) return;
    await Share.share({ message: group.joinCode });
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave "${group?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await groupsService.removeMember(id, currentUserId);
              if (response.success) {
                showToast({ type: "success", label: "You have left the group." });
                router.dismissAll();
                router.replace("/(tabs)/groups");
              } else {
                showToast({ type: "error", label: response.message || "Failed to leave group." });
              }
            } catch (err: any) {
              showToast({ type: "error", label: err.message || "Failed to leave group." });
            }
          },
        },
      ],
    );
  };

  const isAdmin = group?.createdBy === currentUserId;

  if (loading) {
    return (
      <Page showBackButton={true} title="Group">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </Page>
    );
  }

  if (!group) {
    return (
      <Page showBackButton={true} title="Group">
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error[500]} />
          <Gap size={16} />
          <Text style={styles.errorText}>Group not found</Text>
        </View>
      </Page>
    );
  }

  const adminMember = group.members?.find((m) => m.uid === group.createdBy);
  const rawCoachName = adminMember?.name ?? adminMember?.nickname ?? "Coach";
  const coachName    = rawCoachName.split(" ").slice(0, 2).join(" ");
  const memberCount = group.totalMembers ?? 0;

  const sortedMembers = group.members
    ? [
        ...(adminMember ? [adminMember] : []),
        ...(group.members.filter((m) => m.uid !== group.createdBy)),
      ]
    : [];

  const initials = group.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);

  const fab = isAdmin && weekWorkouts.length > 0 ? (
    <TouchableOpacity
      style={styles.fabButton}
      onPress={() => router.push(`/group/workout/create?groupId=${id}`)}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={22} color="#fff" />
      <Text style={styles.fabButtonText}>Create Workout</Text>
    </TouchableOpacity>
  ) : null;

  return (
    <Page showBackButton={true} footer={fab} scrollable={false} contentStyle={{ flex: 1, paddingBottom: 0 }}>
      {/* ── Group header row ── */}
      <View style={styles.groupHeaderRow}>
        <View style={styles.groupMonogram}>
          <Text style={styles.groupMonogramText}>{initials}</Text>
        </View>
        <View style={styles.groupHeaderInfo}>
          <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
          <Text style={styles.groupSubLine}>
            Coach {coachName} · {memberCount} Athlete{memberCount !== 1 ? "s" : ""}
          </Text>
        </View>
        {isAdmin ? (
          <View style={styles.adminPill}>
            <Ionicons name="star" size={12} color={Colors.primary[500]} />
            <Text style={styles.adminPillText}>Admin</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup} activeOpacity={0.8}>
            <Ionicons name="exit-outline" size={14} color={Colors.error[500]} />
            <Text style={styles.leaveButtonText}>Leave</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Admin: join code ── */}
      {isAdmin && (
        <>
          <Gap size={10} />
          <View style={styles.codeSection}>
            <View style={styles.codeSectionTop}>
              <Text style={styles.codeSectionLabel}>Join Code</Text>
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={handleRegenerateCode}
                disabled={regenerating}
              >
                {regenerating ? (
                  <ActivityIndicator size="small" color={Colors.primary[500]} />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={14} color={Colors.primary[500]} />
                    <Text style={styles.regenerateBtnText}>Regenerate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.codeRow} onPress={handleCopyCode}>
              <Text style={styles.codeValue}>{group.joinCode ?? "——"}</Text>
              <Ionicons name="copy-outline" size={18} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <Gap size={16} />

      {/* ── Tabs ── */}
      <View style={styles.tabRow}>
        {(["workouts", "past", "athletes"] as DetailTab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => handleTabChange(tab)}
          >
            <Ionicons
              name={
                tab === "workouts"
                  ? "calendar-outline"
                  : tab === "past"
                  ? "archive-outline"
                  : "people-outline"
              }
              size={14}
              color={activeTab === tab ? Colors.primary[500] : Colors.text.secondary}
            />
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === "workouts" ? "Workouts" : tab === "past" ? "Past" : "Athletes"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Gap size={16} />

      {/* ── Tab content ── */}
      {activeTab === "workouts" ? (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <WeekTimelineView weekWorkouts={weekWorkouts} loading={loadingWeek} groupId={id} isAdmin={isAdmin} coachName={coachName} />
          <Gap size={120} />
        </ScrollView>
      ) : activeTab === "past" ? (
        loadingPast ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        ) : pastWorkouts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="archive-outline" size={40} color={Colors.text.secondary} />
            <Gap size={12} />
            <Text style={styles.emptyTitle}>No past workouts</Text>
            <Text style={styles.emptySubtext}>Completed group workouts will appear here.</Text>
          </View>
        ) : (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {pastWorkouts.map((workout) => (
              <WorkoutItem key={workout.id} workout={workout} groupId={id} isAdmin={isAdmin} />
            ))}
            {pastHasMore && (
              <>
                <Gap size={12} />
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={() => loadPastWorkouts(pastCursor, true)}
                  disabled={loadingMorePast}
                  activeOpacity={0.75}
                >
                  {loadingMorePast ? (
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
            <Gap size={120} />
          </ScrollView>
        )
      ) : sortedMembers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="people-outline" size={40} color={Colors.text.secondary} />
          <Gap size={12} />
          <Text style={styles.emptyTitle}>No athletes found</Text>
          <Text style={styles.emptySubtext}>Athlete details could not be loaded.</Text>
        </View>
      ) : (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {sortedMembers.map((member) => (
            <MemberItem key={member.uid} member={member} groupId={id} isAdmin={isAdmin} />
          ))}
          <Gap size={120} />
        </ScrollView>
      )}
    </Page>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabContent: { flex: 1 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
  },

  // ── Group header ──
  groupHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 2,
  },
  groupMonogram: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  groupMonogramText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(14),
    color: "#fff",
    letterSpacing: 0.5,
  },
  groupHeaderInfo: { flex: 1 },
  groupName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(18),
    color: "#fff",
    lineHeight: responsiveSize(22),
  },
  groupSubLine: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(11.5),
    color: W62,
    marginTop: 1,
  },

  // ── Admin pill / leave button ──
  adminPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary[500] + "18",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  adminPillText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
    color: Colors.primary[500],
  },
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
  leaveButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
    color: Colors.error[500],
  },

  // ── Join code ──
  codeSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "30",
    gap: 10,
  },
  codeSectionTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  codeSectionLabel: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  regenerateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "40",
    backgroundColor: Colors.primary[500] + "10",
  },
  regenerateBtnText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
    color: Colors.primary[500],
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "25",
  },
  codeValue: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(22),
    color: Colors.primary[500],
    letterSpacing: 5,
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primary[500] + "22",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "50",
  },
  tabLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.primary[500],
    fontFamily: FontFamilies.poppinsSemiBold,
  },

  // ── Past WorkoutItem ──
  workoutItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    padding: 12,
    gap: 12,
  },
  workoutItemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  workoutItemBody: { flex: 1, gap: 5 },
  workoutItemTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  workoutItemMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  workoutItemMetaText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  workoutItemDot: { color: Colors.neutral[600], fontSize: FontSizes.bodyXS },
  submissionBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  submissionBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
    color: Colors.text.secondary,
  },
  workoutStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workoutStatusText: { fontFamily: FontFamilies.poppinsSemiBold, fontSize: responsiveSize(10) },

  // ── Members ──
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[500] + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  memberNickname: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary[500] + "18",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  adminBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
    color: Colors.primary[500],
  },

  // ── Load more / empty / FAB ──
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
  emptyState: { alignItems: "center", paddingTop: 40, paddingHorizontal: 32 },
  emptyTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.primary,
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  fabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary[500],
    borderRadius: 14,
    paddingVertical: 14,
  },
  fabButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: "#fff",
  },
});
