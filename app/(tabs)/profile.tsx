import { mascotAssets } from "@/assets/images";
import { Gap, Page } from "@/components";
import { storage, useGlobalState } from "@/components/lib";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// ── Helper: compute age from birth year ────────────────
const getAge = (birthYear?: number) => {
  if (!birthYear) return null;
  return new Date().getFullYear() - birthYear;
};

// ── Helper: member since label ─────────────────────────
const getMemberSince = (createdAt?: Date | any) => {
  console.log("CreatedAt value:", createdAt);
  if (!createdAt) return null;
  const d =
    createdAt._seconds != null
      ? new Date(createdAt._seconds * 1000)
      : new Date(createdAt);
  if (isNaN(d.getTime())) return null;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function ProfileScreen() {
  const { logout, loading } = useAuth();
  const globalState = useGlobalState();
  const user = globalState.get("user");
  const userStorage = storage.get("user") || {};
  console.log("User from global state:", user);
  console.log("User from storage:", userStorage);

  const displayName = useMemo(() => {
    if (!user?.name) return "Athlete";
    return user.name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [user?.name]);

  const nickname = user?.nickname || null;
  const age = getAge(user?.birthYear);
  const memberSince = getMemberSince(user?.createdAt);
  const stats = user?.statsSummary;

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/auth/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <Page showBackButton={false}>
      {/* ── Avatar + Name Card ──────────────────────────── */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRing}>
          <Image
            source={mascotAssets.standard}
            style={styles.avatar}
            contentFit="contain"
          />
        </View>
        <Gap size={14} />
        <Text style={styles.displayName}>{displayName}</Text>
        {nickname && <Text style={styles.nickname}>@{nickname}</Text>}
        {memberSince && (
          <View style={styles.memberRow}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={Colors.text.secondary}
            />
            <Text style={styles.memberText}>Member since {memberSince}</Text>
          </View>
        )}
      </View>

      <Gap size={20} />

      {/* ── Quick Stats Row ─────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.primary[500] + "20" },
            ]}
          >
            <Ionicons name="flame" size={18} color={Colors.primary[500]} />
          </View>
          <Text style={styles.statValue}>{stats?.currentStreak ?? 0}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.fitness.strength + "20" },
            ]}
          >
            <Ionicons
              name="barbell"
              size={18}
              color={Colors.text.success}
            />
          </View>
          <Text style={styles.statValue}>{stats?.completedWorkouts ?? 0}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.warning[500] + "20" },
            ]}
          >
            <Ionicons name="trophy" size={18} color={Colors.warning[500]} />
          </View>
          <Text style={styles.statValue}>{stats?.longestStreak ?? 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      <Gap size={24} />

      {/* ── Body Details Section ────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="body-outline" size={16} color={Colors.primary[500]} />
        <Text style={styles.sectionTitle}>Body Details</Text>
      </View>
      <Gap size={10} />
      <View style={styles.detailsCard}>
        <DetailRow
          icon="person-outline"
          label="Gender"
          value={
            user?.gender
              ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
              : "—"
          }
        />
        <View style={styles.detailDivider} />
        <DetailRow
          icon="calendar-outline"
          label="Age"
          value={age ? `${age} years` : "—"}
        />
        <View style={styles.detailDivider} />
        <DetailRow
          icon="resize-outline"
          label="Height"
          value={user?.height ? `${user.height} cm` : "—"}
        />
        <View style={styles.detailDivider} />
        <DetailRow
          icon="scale-outline"
          label="Weight"
          value={user?.weight ? `${user.weight} kg` : "—"}
        />
      </View>

      <Gap size={24} />

      {/* ── Latest PR Highlight (if exists) ─────────────── */}
      {stats?.latestPR?.exerciseName && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={16} color={Colors.primary[500]} />
            <Text style={styles.sectionTitle}>Latest PR</Text>
          </View>
          <Gap size={10} />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: `/pr/${stats.latestPR.exerciseId}`,
                params: { name: stats.latestPR.exerciseName },
              } as any)
            }
          >
            <View style={styles.prCard}>
              <View style={styles.prAccent} />
              <View style={styles.prBody}>
                <Text style={styles.prName} numberOfLines={1}>
                  {stats.latestPR.exerciseName}
                </Text>
                <Text style={styles.prSubtext}>Estimated 1RM</Text>
              </View>
              <View style={styles.prValueContainer}>
                <Text style={styles.prValue}>
                  {stats.latestPR.value}
                </Text>
                <Text style={styles.prUnit}>KG</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.neutral[600]}
                style={{ marginRight: 14 }}
              />
            </View>
          </TouchableOpacity>
          <Gap size={24} />
        </>
      )}

      {/* ── Account Section ─────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Ionicons
          name="settings-outline"
          size={16}
          color={Colors.primary[500]}
        />
        <Text style={styles.sectionTitle}>Account</Text>
      </View>
      <Gap size={10} />
      <View style={styles.detailsCard}>
        <DetailRow
          icon="mail-outline"
          label="Email"
          value={user?.email || "—"}
        />
        <View style={styles.detailDivider} />
        <DetailRow
          icon="call-outline"
          label="Phone"
          value={user?.mobileNumber || "—"}
        />
      </View>

      <Gap size={32} />

      {/* ── Logout Button ───────────────────────────────── */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}
        disabled={loading}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.error[500]} />
        <Text style={styles.logoutText}>
          {loading ? "Logging out…" : "Logout"}
        </Text>
      </TouchableOpacity>
      <Gap size={40} />
    </Page>
  );
}

/* ── Detail Row Sub-component ─────────────────────────── */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={16} color={Colors.text.secondary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/* ── Styles ───────────────────────────────────────────── */
const styles = StyleSheet.create({
  // ── Profile Card ──────────────────────────────────────
  profileCard: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 8,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary[600],
  },
  avatar: {
    width: 72,
    height: 72,
  },
  displayName: {
    fontSize: FontSizes.heading2XL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
    textAlign: "center",
  },
  nickname: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.primary[500],
    marginTop: 2,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  memberText: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },

  // ── Stats Row ─────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.secondary[600],
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: FontSizes.headingXL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
  statLabel: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },

  // ── Section Header ────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: FontSizes.headingLG,
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.text.primary,
  },

  // ── Details Card ──────────────────────────────────────
  detailsCard: {
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.text.inverse,
    maxWidth: screenWidth * 0.45,
    textAlign: "right",
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.neutral[700],
    marginHorizontal: 16,
  },

  // ── Latest PR Card ────────────────────────────────────
  prCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    overflow: "hidden",
  },
  prAccent: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: Colors.primary[500],
  },
  prBody: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 2,
  },
  prName: {
    fontSize: FontSizes.headingMD,
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.text.inverse,
  },
  prSubtext: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  prValueContainer: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  prValue: {
    fontSize: FontSizes.heading2XL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.primary[500],
  },
  prUnit: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsBold,
    color: Colors.text.secondary,
    marginTop: -4,
  },

  // ── Logout Button ─────────────────────────────────────
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.error[500] + "15",
    borderWidth: 1,
    borderColor: Colors.error[500] + "40",
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: FontSizes.headingMD,
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.error[500],
  },
});
