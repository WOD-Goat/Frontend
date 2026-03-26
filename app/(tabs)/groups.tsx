import { groupsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { Group } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { parseFirebaseDate } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
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
              {group.memberIds?.length ?? 0} member
              {(group.memberIds?.length ?? 0) !== 1 ? "s" : ""}
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

type FilterType = "all" | "admin" | "member";

const FILTER_TABS: { key: FilterType; label: string; icon: any }[] = [
  { key: "all", label: "All", icon: "apps" },
  { key: "admin", label: "Admin", icon: "star" },
  { key: "member", label: "Member", icon: "person" },
];

export default function GroupsScreen() {
  const [allGroups, setAllGroups] = useState<(Group & { isAdmin: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const { showToast } = useToast();
  const globalState = useGlobalState();
  const currentUid = globalState.get("user")?.uid;

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
      const [myRes, memberRes] = await Promise.all([
        groupsService.getMyGroups(),
        groupsService.getMemberGroups(),
      ]);
const myGroups = (myRes.success ? myRes.data ?? [] : []).map((g) => ({ ...g, isAdmin: true }));
      const joinedGroups = (memberRes.success ? memberRes.data ?? [] : [])
        .filter((g) => g.createdBy !== currentUid)
        .map((g) => ({ ...g, isAdmin: false }));
      setAllGroups([...myGroups, ...joinedGroups]);
      if (!myRes.success || !memberRes.success) {
        showToast({ type: "error", label: "Failed to load some groups" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to load groups" });
    } finally {
      setLoading(false);
    }
  };

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
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => router.push("/group/join")}
        >
          <Ionicons
            name="enter-outline"
            size={16}
            color={Colors.primary[500]}
          />
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>

      <Gap size={16} />

      {/* Filter pills */}
      {!loading && allGroups.length > 0 && (
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
      ) : allGroups.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {allGroups
            .filter((g) => filter === "all" || (filter === "admin" ? g.isAdmin : !g.isAdmin))
            .map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          <Gap size={160} />
        </ScrollView>
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
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
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
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
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
    fontFamily: FontFamilies.poppinsBold,
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
    fontFamily: FontFamilies.poppinsSemiBold,
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
    fontFamily: FontFamilies.poppinsRegular,
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
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
