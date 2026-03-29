import { groupsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { useGlobalState } from "@/components/lib";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { GroupMember, GroupWithMembers, GroupWorkout } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { parseFirebaseDate } from "@/utils";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


type DetailTab = "workouts" | "members";

function WorkoutItem({ workout, groupId }: { workout: GroupWorkout; groupId: string }) {
  const date = parseFirebaseDate(workout.scheduledFor);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateDay = new Date(date);
  dateDay.setHours(0, 0, 0, 0);
  const isPast = dateDay < today;
  const isToday = dateDay.getTime() === today.getTime();

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

      <View style={[styles.workoutStatusBadge, { backgroundColor: status.color + "18" }]}>
        <Ionicons name={status.icon} size={11} color={status.color} />
        <Text style={[styles.workoutStatusText, { color: status.color }]}>{status.label}</Text>
      </View>
    </Pressable>
  );
}

function MemberItem({ member }: { member: GroupMember }) {
  const initials = (member.name ?? member.nickname ?? "?")[0].toUpperCase();
  return (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{initials}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name || member.nickname}</Text>
        {member.nickname && (
          <Text style={styles.memberNickname}>@{member.nickname}</Text>
        )}
      </View>
      {member.isAdmin && (
        <View style={styles.adminBadge}>
          <Ionicons name="star" size={10} color={Colors.primary[500]} />
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      )}
    </View>
  );
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [workouts, setWorkouts] = useState<GroupWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("workouts");
  const [regenerating, setRegenerating] = useState(false);
  const { showToast } = useToast();
  const globalState = useGlobalState();
  const currentUserId = globalState.get("user")?.uid ?? "";

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupRes, workoutsRes] = await Promise.all([
        groupsService.getGroupById(id),
        groupsService.getGroupWorkouts(id),
      ]);
      if (groupRes.success && groupRes.data) setGroup(groupRes.data);
      if (workoutsRes.success && workoutsRes.data) setWorkouts(workoutsRes.data);
      if (!groupRes.success) {
        showToast({ type: "error", label: groupRes.message || "Group not found" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to load group" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCode = async () => {
    try {
      setRegenerating(true);
      const response = await groupsService.regenerateCode(id);
      if (response.success && response.data) {
        setGroup((prev) => prev ? { ...prev, joinCode: response.data.joinCode } : prev);
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

  const fab = isAdmin ? (
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
    <Page showBackButton={true} title={group.name} footer={fab}>
      {/* Group header card */}
      <View style={styles.headerCard}>
        <View style={styles.headerCardLeft}>
          <View style={styles.groupIcon}>
            <Text style={styles.groupIconText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.memberCount}>
              {group.members?.length ?? 0} member{(group.members?.length ?? 0) !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        {isAdmin && (
          <View style={styles.adminPill}>
            <Ionicons name="star" size={12} color={Colors.primary[500]} />
            <Text style={styles.adminPillText}>Admin</Text>
          </View>
        )}
      </View>

      {/* Admin: join code section */}
      {isAdmin && (
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
      )}

      <Gap size={16} />

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(["workouts", "members"] as DetailTab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === "workouts" ? "barbell-outline" : "people-outline"}
              size={14}
              color={activeTab === tab ? Colors.primary[500] : Colors.text.secondary}
            />
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === "workouts" ? "Workouts" : "Members"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Gap size={16} />

      {/* Tab content */}
      {activeTab === "workouts" ? (
        workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={40} color={Colors.text.secondary} />
            <Gap size={12} />
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptySubtext}>
              {isAdmin
                ? "Post your first group workout using the button below."
                : "The admin hasn't posted any workouts yet."}
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {workouts.map((workout) => (
              <WorkoutItem key={workout.id} workout={workout} groupId={id} />
            ))}
            <Gap size={160} />
          </ScrollView>
        )
      ) : sortedMembers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={40} color={Colors.text.secondary} />
          <Gap size={12} />
          <Text style={styles.emptyTitle}>No members found</Text>
          <Text style={styles.emptySubtext}>Member details could not be loaded.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {sortedMembers.map((member) => (
            <MemberItem key={member.uid} member={member} />
          ))}
          <Gap size={160} />
        </ScrollView>
      )}

    </Page>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "30",
    marginBottom: 12,
  },
  headerCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  groupIcon: {
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
  groupIconText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingMD,
    color: Colors.primary[500],
    letterSpacing: 0.5,
  },
  groupName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  memberCount: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    marginTop: 2,
  },
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
  codeSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "30",
    gap: 10,
  },
  codeSectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  workoutItemBody: {
    flex: 1,
    gap: 5,
  },
  workoutItemTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  workoutItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workoutItemMetaText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  workoutItemDot: {
    color: Colors.neutral[600],
    fontSize: FontSizes.bodyXS,
  },
  workoutStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workoutStatusText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(10),
  },
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
    overflow: "hidden",
  },
  memberAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberAvatarText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
  },
  memberInfo: {
    flex: 1,
  },
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
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 32,
  },
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
