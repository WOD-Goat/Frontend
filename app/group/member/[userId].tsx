import { groupsService } from "@/api/services";
import { Gap, Page } from "@/components";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { MemberDetail, MemberSubmission } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatResult(result: MemberSubmission["results"][number]): string {
  if (result.weight != null && result.reps != null)
    return `${result.weight}kg × ${result.reps}`;
  if (result.reps != null) return `${result.reps} reps`;
  if (result.timeInSeconds != null) {
    const m = Math.floor(result.timeInSeconds / 60);
    const s = result.timeInSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  if (result.distanceMeters != null) {
    return result.distanceMeters >= 1000
      ? `${(result.distanceMeters / 1000).toFixed(2)}km`
      : `${result.distanceMeters}m`;
  }
  if (result.calories != null) return `${result.calories} cal`;
  return "—";
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBg, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getExerciseName(
  submission: MemberSubmission,
  r: MemberSubmission["results"][number],
): string | null {
  if (r.exerciseName) return r.exerciseName;
  if (submission.wods) {
    const wod = submission.wods[r.wodIndex];
    const ex = wod?.exercises?.[r.exerciseIndex];
    if (ex?.name) return ex.name;
  }
  return null;
}

function SubmissionCard({ submission }: { submission: MemberSubmission }) {
  const results = submission.results.filter(
    (r) =>
      r.weight != null ||
      r.reps != null ||
      r.timeInSeconds != null ||
      r.distanceMeters != null ||
      r.calories != null,
  );

  return (
    <View style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <Text style={styles.submissionTitle} numberOfLines={1}>
          {submission.workoutTitle || "Group Workout"}
        </Text>
        <Text style={styles.submissionDate}>
          {formatDate(submission.scheduledFor)}
        </Text>
      </View>

      {results.length > 0 ? (
        <View style={styles.resultsRow}>
          {results.map((r, i) => {
            const exName = getExerciseName(submission, r);
            return (
              <View key={i} style={styles.resultChip}>
                {exName ? (
                  <Text style={styles.resultChipText}>
                    <Text style={styles.resultChipLabel}>{exName}: </Text>
                    {formatResult(r)}
                  </Text>
                ) : (
                  <Text style={styles.resultChipText}>{formatResult(r)}</Text>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.noResultsText}>Completed (no tracked results)</Text>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MemberDetailScreen() {
  const { userId, groupId } = useLocalSearchParams<{
    userId: string;
    groupId: string;
  }>();
  const [data, setData] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subDueDate, setSubDueDate] = useState<Date>(new Date());
  const [subSuspended, setSubSuspended] = useState(false);
  const [subSaving, setSubSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subExpanded, setSubExpanded] = useState(false);
  const subInitialized = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (userId && groupId) loadData();
  }, [userId, groupId]);

  useEffect(() => {
    if (data && !subInitialized.current) {
      subInitialized.current = true;
      setSubDueDate(
        data.subscription?.dueDate
          ? new Date(data.subscription.dueDate)
          : new Date(),
      );
      setSubSuspended(data.subscription?.suspended ?? false);
    }
  }, [data]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await groupsService.getMemberDetail(groupId, userId);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to load member details");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load member details");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = () => {
    const memberName =
      data?.member.name ?? data?.member.nickname ?? "this member";
    Alert.alert(
      "Remove Member",
      `Remove ${memberName} from the group? They will lose access to all group workouts.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
              try {
                const response = await groupsService.removeMember(groupId, userId);
                if (response.success) {
                  showToast({ type: "success", label: `${memberName} removed from group` });
                router.dismiss();
              router.replace(`/group/${groupId}`);
                } else {
                  showToast({ type: "error", label: (response as any).message || "Failed to remove member" });
                }
              } catch (err: any) {
                showToast({ type: "error", label: err.message || "Failed to remove member" });
              }
          },
        },
      ],
    );
  };

  const handleSaveSubscription = async () => {
    try {
      setSubSaving(true);
      const response = await groupsService.setMemberSubscription(
        groupId,
        userId,
        {
          dueDate: subDueDate.toISOString(),
          suspended: subSuspended,
        },
      );
      if (response.success) {
        showToast({ type: "success", label: "Subscription updated" });
        subInitialized.current = false;
        setSubExpanded(false);
        setShowDatePicker(false);
        await loadData();
      } else {
        showToast({
          type: "error",
          label: (response as any).message || "Failed to update subscription",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        label: err.message || "Failed to update subscription",
      });
    } finally {
      setSubSaving(false);
    }
  };

  if (loading) {
    return (
      <Page showBackButton title="Athlete">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </Page>
    );
  }

  if (error || !data) {
    return (
      <Page showBackButton title="Athlete">
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors.error[500]}
          />
          <Gap size={12} />
          <Text style={styles.errorText}>{error || "Member not found"}</Text>
        </View>
      </Page>
    );
  }

  const { member, personalStats, groupStats, subscription, recentSubmissions } =
    data;
  const initials = (member.name ?? member.nickname ?? "?")[0].toUpperCase();
  const isSubscriptionSuspended = subscription?.suspended === true;
  const isDueSoon = subscription?.dueDate
    ? new Date(subscription.dueDate) <=
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : false;
  const isPastDue = subscription?.dueDate
    ? new Date(subscription.dueDate) < new Date()
    : false;

  return (
    <Page
      showBackButton
      title={member.name ?? member.nickname ?? "Athlete"}
      headerRight={
        <TouchableOpacity
          onPress={handleRemoveMember}
          style={styles.removeHeaderBtn}
        >
          <Ionicons
            name="person-remove-outline"
            size={22}
            color={Colors.error[500]}
          />
        </TouchableOpacity>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Profile header ─────────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Gap size={12} />
          <Text style={styles.memberName}>
            {member.name || member.nickname}
          </Text>
          {member.nickname && member.name && (
            <Text style={styles.memberNickname}>@{member.nickname}</Text>
          )}
        </View>

        <Gap size={16} />

        {/* ── Subscription ────────────────────────────────── */}
        <View style={styles.subCard}>
          <View style={styles.subCardTop}>
            <View>
              <Text style={styles.subLabel}>Subscription</Text>
              <Text
                style={[
                  styles.subValue,
                  isSubscriptionSuspended && { color: Colors.error[500] },
                ]}
              >
                {isSubscriptionSuspended
                  ? "Suspended"
                  : subscription?.dueDate
                    ? formatDate(subscription.dueDate)
                    : "Not set"}
              </Text>
            </View>
            <View style={styles.subRight}>
              {subscription?.dueDate && !isSubscriptionSuspended && (
                <View
                  style={[
                    styles.subChip,
                    isSubscriptionSuspended
                      ? styles.subChipSuspended
                      : isPastDue
                        ? styles.subChipOverdue
                        : isDueSoon
                          ? styles.subChipWarn
                          : styles.subChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.subChipText,
                      {
                        color: isSubscriptionSuspended
                          ? Colors.error[500]
                          : isPastDue
                            ? Colors.error[500]
                            : isDueSoon
                              ? Colors.warning[500]
                              : Colors.success[500],
                      },
                    ]}
                  >
                    {isSubscriptionSuspended
                      ? "Suspended"
                      : isPastDue
                        ? "Overdue"
                        : isDueSoon
                          ? "Due soon"
                          : "Active"}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => {
                  setSubExpanded((v) => !v);
                  setShowDatePicker(false);
                }}
                style={styles.subEditBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={subExpanded ? "close" : "create-outline"}
                  size={18}
                  color={Colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {subExpanded && (
            <>
              <View style={styles.subDivider} />

              <TouchableOpacity
                style={styles.subDateRow}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={Colors.text.secondary}
                />
                <Text style={styles.subDateText}>
                  {subDueDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.text.tertiary}
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <>
                  <DateTimePicker
                    value={subDueDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, selected) => {
                      if (Platform.OS === "android") setShowDatePicker(false);
                      if (selected) setSubDueDate(selected);
                    }}
                  />
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={styles.subDoneBtn}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.subDoneBtnText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={styles.subSuspendRow}>
                <Text style={styles.subSuspendLabel}>Suspended</Text>
                <Switch
                  value={subSuspended}
                  onValueChange={setSubSuspended}
                  trackColor={{
                    false: Colors.neutral[700],
                    true: Colors.error[500],
                  }}
                  thumbColor="#fff"
                />
              </View>

              <TouchableOpacity
                style={[styles.subSaveBtn, subSaving && { opacity: 0.55 }]}
                onPress={handleSaveSubscription}
                disabled={subSaving}
              >
                <Text style={styles.subSaveBtnText}>
                  {subSaving ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Gap size={20} />

        {/* ── Personal stats ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Personal</Text>
        <Gap size={10} />
        <View style={styles.statsRow}>
          <StatCard
            icon="flame"
            label="Streak"
            value={String(personalStats.currentStreak)}
            color={Colors.primary[500]}
          />
          <StatCard
            icon="trophy"
            label="Best Streak"
            value={String(personalStats.longestStreak)}
            color={Colors.warning[500]}
          />
        </View>

        <Gap size={20} />

        {/* ── Group stats ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>In This Group</Text>
        <Gap size={10} />
        <View style={styles.groupStatsCard}>
          <View style={styles.groupStatRow}>
            <Text style={styles.groupStatLabel}>Workouts Completed</Text>
            <Text style={styles.groupStatValue}>
              {groupStats.completedWorkouts}
              <Text style={styles.groupStatTotal}>
                {" "}
                / {groupStats.totalWorkouts}
              </Text>
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, groupStats.completionRate)}%` },
              ]}
            />
          </View>
          <Text style={styles.completionRate}>
            {groupStats.completionRate.toFixed(0)}% completion rate
          </Text>
        </View>

        <Gap size={20} />

        {/* ── Recent submissions ──────────────────────────── */}
        <Text style={styles.sectionTitle}>Recent Submissions</Text>
        <Gap size={10} />
        {recentSubmissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="barbell-outline"
              size={36}
              color={Colors.text.secondary}
            />
            <Gap size={8} />
            <Text style={styles.emptyText}>No submissions yet</Text>
          </View>
        ) : (
          recentSubmissions.map((sub, i) => (
            <SubmissionCard key={sub.workoutId ?? i} submission={sub} />
          ))
        )}

        <Gap size={80} />
      </ScrollView>
    </Page>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    textAlign: "center",
  },

  // Profile header
  profileHeader: { alignItems: "center", paddingTop: 12 },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[500] + "20",
    borderWidth: 2,
    borderColor: Colors.primary[500] + "50",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(28),
    color: Colors.primary[500],
  },
  memberName: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
  },
  memberNickname: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },

  // Personal stats
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
  },
  statLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },

  // Group stats
  groupStatsCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  groupStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupStatLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
  groupStatValue: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.primary,
  },
  groupStatTotal: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.neutral[700],
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.primary[500],
    borderRadius: 3,
  },
  completionRate: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    textAlign: "right",
  },

  // Submissions
  submissionCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    gap: 10,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submissionTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    flex: 1,
  },
  submissionDate: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  resultsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  resultChip: {
    backgroundColor: Colors.primary[500] + "15",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  resultChipText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(11),
    color: Colors.primary[500],
  },
  resultChipLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  noResultsText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    fontStyle: "italic",
  },

  // Empty state
  removeHeaderBtn: { padding: 4 },
  // Subscription
  subCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  subCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  subValue: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  subRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  subChipActive: { backgroundColor: Colors.success[500] + "18" },
  subChipWarn: { backgroundColor: Colors.warning[500] + "18" },
  subChipOverdue: { backgroundColor: Colors.error[500] + "18" },
  subChipSuspended: { backgroundColor: Colors.error[500] + "18" },
  subChipText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: responsiveSize(11),
  },
  subEditBtn: { padding: 2 },
  subDivider: {
    height: 1,
    backgroundColor: Colors.neutral[700],
    marginVertical: 14,
  },
  subDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  subDateText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  subDoneBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
    backgroundColor: Colors.primary[500] + "20",
    borderRadius: 8,
  },
  subDoneBtnText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  subSuspendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  subSuspendLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  subSaveBtn: {
    backgroundColor: Colors.primary[500],
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 4,
  },
  subSaveBtnText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: "#000",
  },
  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
});
