import { groupsService, programsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
import type { Group, MemberProgram } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { parseFirebaseDate } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


function usePulse() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return pulse;
}


function GroupCardSkeleton() {
  const pulse = usePulse();
  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulse }]}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineSm} />
      </View>
    </Animated.View>
  );
}

function GroupCard({ group }: { group: Group & { isAdmin: boolean } }) {
  const { isAdmin } = group;
  const initials = group.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
  const lastWorkout = group.latestWorkoutDate
    ? parseFirebaseDate(group.latestWorkoutDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;
  const createdDate = group.createdAt
    ? parseFirebaseDate(group.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Pressable
      style={styles.groupCard}
      onPress={() => router.push(`/group/${group.id}`)}
    >
      {/* Avatar */}
      <View style={styles.groupAvatar}>
        <Text style={styles.groupAvatarText}>{initials}</Text>
      </View>

      {/* Content */}
      <View style={styles.groupCardContent}>
        {/* Top row: name + admin badge */}
        <View style={styles.groupCardNameRow}>
          <Text style={styles.groupCardName} numberOfLines={1}>
            {group.name}
          </Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons
                name="star"
                size={10}
                color={Colors.primary[500]}
              />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Stat pills */}
        <View style={styles.statPills}>
          <View style={styles.statPill}>
            <Ionicons name="people" size={11} color={Colors.text.secondary} />
            <Text style={styles.statPillText}>
              {group.totalMembers ?? 0} Athlete
              {(group.totalMembers ?? 0) !== 1 ? "s" : ""}
            </Text>
          </View>
          {lastWorkout && (
            <View style={styles.statPill}>
              <Ionicons
                name="barbell-outline"
                size={11}
                color={Colors.text.secondary}
              />
              <Text style={styles.statPillText}>Last {lastWorkout}</Text>
            </View>
          )}
          {!lastWorkout && createdDate && (
            <View style={styles.statPill}>
              <Ionicons
                name="calendar-outline"
                size={11}
                color={Colors.text.secondary}
              />
              <Text style={styles.statPillText}>Since {createdDate}</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.neutral[600]} />
    </Pressable>
  );
}

function ProgramCard({ program }: { program: MemberProgram }) {
  const initials = program.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
  const progressPct = Math.min(100, Math.max(0, Math.round((program.currentDayNumber / program.durationDays) * 100)));

  return (
    <Pressable style={styles.groupCard} onPress={() => router.push(`/program/${program.id}` as any)}>
      <View style={[styles.groupAvatar, styles.programAvatar]}>
        <Text style={styles.groupAvatarText}>{initials}</Text>
      </View>
      <View style={styles.groupCardContent}>
        <View style={styles.groupCardNameRow}>
          <Text style={styles.groupCardName} numberOfLines={1}>
            {program.name}
          </Text>
          <View style={styles.programBadge}>
            <Ionicons name="calendar" size={10} color={Colors.primary[500]} />
            <Text style={styles.adminBadgeText}>Program</Text>
          </View>
        </View>
        <View style={styles.statPills}>
          <View style={styles.statPill}>
            <Ionicons name="flame-outline" size={11} color={Colors.text.secondary} />
            <Text style={styles.statPillText}>
              {program.isComplete ? "Completed" : `Day ${program.currentDayNumber}/${program.durationDays}`}
            </Text>
          </View>
        </View>
        <View style={styles.programProgressTrack}>
          <View style={[styles.programProgressFill, { width: `${progressPct}%` }]} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.neutral[600]} />
    </Pressable>
  );
}

function LockedGroupCard({
  group,
  hint,
  onUpgrade,
}: {
  group: Group & { isAdmin: boolean };
  hint: string;
  onUpgrade: () => void;
}) {
  const initials = group.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);

  return (
    <Pressable style={[styles.groupCard, styles.lockedCard]} onPress={onUpgrade}>
      <View style={[styles.groupAvatar, styles.lockedAvatar]}>
        <Text style={[styles.groupAvatarText, styles.lockedAvatarText]}>{initials}</Text>
      </View>
      <View style={styles.groupCardContent}>
        <View style={styles.groupCardNameRow}>
          <Text style={[styles.groupCardName, styles.lockedText]} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={10} color={Colors.primary[400]} />
            <Text style={styles.lockedBadgeText}>Locked</Text>
          </View>
        </View>
        <Text style={styles.lockedHint}>{hint}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.neutral[700]} />
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconRing}>
        <Ionicons name="people-outline" size={36} color={Colors.primary[500]} />
      </View>
      <Gap size={16} />
      <Text style={styles.emptyTitle}>No groups yet</Text>
      <Text style={styles.emptySubtext}>
        Create a group or join one using a 6-character code.
      </Text>
    </View>
  );
}

type FilterType = "all" | "groups" | "programs";

const FILTER_TABS: { key: FilterType; label: string; icon: any }[] = [
  { key: "all", label: "All", icon: "apps" },
  { key: "groups", label: "Groups", icon: "people" },
  { key: "programs", label: "Programs", icon: "calendar" },
];

type ListItem =
  | { kind: "group"; id: string; group: Group & { isAdmin: boolean } }
  | { kind: "program"; id: string; program: MemberProgram };

// Bounds the "fetch everything" backend read — real infinite scroll isn't wired
// up here yet since the groupJoinMax lock logic below depends on having the
// full joined-groups set in memory to compute which ones are over the limit.
const GROUPS_FETCH_LIMIT = 100;

export default function GroupsScreen() {
  const [allGroups, setAllGroups] = useState<(Group & { isAdmin: boolean })[]>([]);
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const { showToast } = useToast();
  const globalState = useGlobalState();
  const currentUid = globalState.get("user")?.uid;
  const { guard, guardLimit, canAccess, withinLimit, coachSuspensionReason } = useFeatureGuard();

  const filterScales = useRef(
    FILTER_TABS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.95)),
  ).current;

  const handleFilterPress = (key: FilterType, index: number) => {
    setFilter(key);
    FILTER_TABS.forEach((_, i) => {
      Animated.spring(filterScales[i], {
        toValue: i === index ? 1 : 0.95,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    });
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const [myRes, memberRes, programsRes] = await Promise.all([
        groupsService.getMyGroups(GROUPS_FETCH_LIMIT),
        groupsService.getMemberGroups(GROUPS_FETCH_LIMIT),
        programsService.getMemberPrograms(),
      ]);
const myGroups = (myRes.success ? myRes.data ?? [] : []).map((g) => ({ ...g, isAdmin: true }));
      const joinedGroups = (memberRes.success ? memberRes.data ?? [] : [])
        .filter((g) => g.createdBy !== currentUid)
        .map((g) => ({ ...g, isAdmin: false }));
      setAllGroups([...myGroups, ...joinedGroups]);
      setPrograms(programsRes.success ? programsRes.data ?? [] : []);
      if (!myRes.success || !memberRes.success) {
        showToast({ type: "error", label: "Failed to load some groups" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to load groups" });
    } finally {
      setLoading(false);
    }
  };

  // Determine which joined groups are over the plan limit.
  // Sort by createdAt ascending so the oldest (first joined) stays accessible.
  const joinedGroups = allGroups.filter((g) => !g.isAdmin);
  const sortedJoined = [...joinedGroups].sort((a, b) => {
    const aDate = a.createdAt ? parseFirebaseDate(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? parseFirebaseDate(b.createdAt).getTime() : 0;
    return aDate - bDate;
  });
  const lockedJoinedIds = new Set(
    sortedJoined
      .filter((_, i) => !withinLimit("groupJoinMax", i))
      .map((g) => g.id),
  );

  const combinedItems: ListItem[] = [
    ...programs.map((program): ListItem => ({ kind: "program", id: `program-${program.id}`, program })),
    ...allGroups.map((group): ListItem => ({ kind: "group", id: `group-${group.id}`, group })),
  ];

  const visibleItems = combinedItems.filter((item) => {
    if (filter === "all") return true;
    return filter === "programs" ? item.kind === "program" : item.kind === "group";
  });

  return (
    <Page showBackButton={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Groups</Text>
          <Text style={styles.headerSubtitle}>
            Train together, compete together
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => {
              const joinedCount = allGroups.filter((g) => !g.isAdmin).length;
              guardLimit("groupJoinMax", joinedCount, () =>
                router.push("/group/join"),
              );
            }}
          >
            <Ionicons
              name="enter-outline"
              size={16}
              color={Colors.primary[500]}
            />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Gap size={16} />

      {/* Filter pills */}
      {!loading && combinedItems.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((tab, i) => {
            const isActive = filter === tab.key;
            return (
              <Animated.View key={tab.key} style={{ transform: [{ scale: filterScales[i] }] }}>
                <Pressable
                  onPress={() => handleFilterPress(tab.key, i)}
                  style={[
                    styles.filterPill,
                    isActive && {
                      backgroundColor: Colors.primary[500] + "20",
                      borderColor: Colors.primary[500] + "60",
                    },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={13}
                    color={isActive ? Colors.primary[500] : Colors.text.secondary}
                  />
                  <Text style={[styles.filterPillText, { color: isActive ? Colors.primary[500] : Colors.text.secondary }]}>
                    {tab.label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      <Gap size={12} />

      {/* Content */}
      {loading ? (
        <>
          {[0, 1, 2, 3].map((i) => <GroupCardSkeleton key={i} />)}
        </>
      ) : combinedItems.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.kind === "program") {
              return <ProgramCard program={item.program} />;
            }
            const group = item.group;
            if (!group.isAdmin && lockedJoinedIds.has(group.id)) {
              return (
                <LockedGroupCard
                  group={group}
                  hint="Upgrade to Athlete Pro to access"
                  onUpgrade={() =>
                    guardLimit("groupJoinMax", joinedGroups.length, () =>
                      router.push(`/group/${group.id}`),
                    )
                  }
                />
              );
            }
            if (group.isAdmin && !canAccess("createGroup")) {
              return (
                <LockedGroupCard
                  group={group}
                  hint={
                    coachSuspensionReason === 'expired'
                      ? "Subscription expired — contact WODGoat team to resubscribe"
                      : coachSuspensionReason === 'admin'
                      ? "Account suspended — contact WODGoat team"
                      : "Coach feature — apply from your profile"
                  }
                  onUpgrade={() =>
                    guard("createGroup", () => router.push(`/group/${group.id}`))
                  }
                />
              );
            }
            return <GroupCard group={group} />;
          }}
          ListFooterComponent={<Gap size={160} />}
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 28,
  },
  headerSubtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: 20,
  },
  filterRow: {
    gap: 8,
    paddingHorizontal: 2,
  },
  filterPill: {
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
  filterPillText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: FontSizes.bodySM,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[500] + "18",
  },
  joinButtonText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  sectionLabel: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(12),
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  programAvatar: {
    backgroundColor: Colors.primary[500] + "30",
  },
  programBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary[500] + "18",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  programProgressTrack: {
    height: 3,
    backgroundColor: Colors.neutral[700],
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 2,
  },
  programProgressFill: {
    height: 3,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    padding: 14,
    gap: 14,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary[500] + "20",
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "40",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  groupAvatarText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingMD,
    color: Colors.primary[500],
    letterSpacing: 0.5,
  },
  groupCardContent: {
    flex: 1,
    gap: 8,
  },
  groupCardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupCardName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    flex: 1,
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
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: responsiveSize(10),
    color: Colors.primary[500],
  },
  statPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  statPillText: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: responsiveSize(11),
    color: Colors.text.secondary,
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    padding: 14,
    gap: 14,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.neutral[700],
    flexShrink: 0,
  },
  skeletonContent: {
    flex: 1,
    gap: 10,
  },
  skeletonLine: {
    height: 13,
    borderRadius: 6,
    backgroundColor: Colors.neutral[700],
    width: "60%",
  },
  skeletonLineSm: {
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.neutral[700],
    width: "40%",
  },
  lockedCard: {
    opacity: 0.55,
  },
  lockedAvatar: {
    backgroundColor: Colors.neutral[700] + "40",
    borderColor: Colors.neutral[600] + "40",
  },
  lockedAvatarText: {
    color: Colors.neutral[500],
  },
  lockedText: {
    color: Colors.text.secondary,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary[500] + "18",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "50",
  },
  lockedBadgeText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: responsiveSize(10),
    color: Colors.primary[400],
  },
  lockedHint: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: responsiveSize(11),
    color: Colors.primary[400],
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[500] + "15",
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
