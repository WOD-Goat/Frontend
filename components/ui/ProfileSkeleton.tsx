import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Gap from "../ui/Gap";
import Page from "../ui/Page";
import Skeleton from "../ui/Skeleton";

/**
 * Skeleton for the Profile tab — mirrors avatar card, stats row,
 * account details sections, and logout button layout.
 */
export default function ProfileSkeleton() {
  return (
    <Page showBackButton={false}>
      {/* ── Avatar + Name Card ──────────────────────────── */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRing}>
          <Skeleton width={72} height={72} borderRadius={36} />
        </View>
        <Gap size={14} />
        <Skeleton width={160} height={24} borderRadius={8} />
        <Gap size={6} />
        <Skeleton width={100} height={14} borderRadius={6} />
      </View>

      <Gap size={20} />

      {/* ── Quick Stats Row ─────────────────────────────── */}
      <View style={styles.statsRow}>
        {[
          {
            icon: "flame" as const,
            color: Colors.primary[500],
            label: "Streak",
          },
          {
            icon: "barbell" as const,
            color: Colors.text.success,
            label: "Workouts",
          },
          {
            icon: "trophy" as const,
            color: Colors.warning[500],
            label: "Best Streak",
          },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: stat.color + "20" },
              ]}
            >
              <Ionicons name={stat.icon} size={18} color={stat.color} />
            </View>
            <Skeleton width={28} height={22} borderRadius={6} />
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Gap size={24} />

      {/* ── Latest PR section skeleton ──────────────────── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="star" size={16} color={Colors.primary[500]} />
        <Text style={styles.sectionTitle}>Latest PR</Text>
      </View>
      <Gap size={10} />
      <View style={styles.prCard}>
        <View style={styles.prAccent} />
        <View style={styles.prBody}>
          <Skeleton width={140} height={16} borderRadius={6} />
          <Gap size={4} />
          <Skeleton width={90} height={10} borderRadius={4} />
        </View>
        <View style={{ alignItems: "flex-end", gap: 2, marginRight: 14 }}>
          <Skeleton width={40} height={24} borderRadius={6} />
          <Skeleton width={20} height={8} borderRadius={4} />
        </View>
      </View>

      <Gap size={24} />

      {/* ── Account section skeleton ────────────────────── */}
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
        {["Plan", "Email", "Nickname", "Member Since"].map((label, i) => (
          <View key={label}>
            <View style={styles.detailRow}>
              <Skeleton width={100} height={14} borderRadius={4} />
              <Skeleton width={80} height={14} borderRadius={4} />
            </View>
            {i < 3 && <View style={styles.detailDivider} />}
          </View>
        ))}
      </View>

      <Gap size={24} />

      {/* ── Features section skeleton ───────────────────── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="star" size={16} color={Colors.primary[500]} />
        <Text style={styles.sectionTitle}>Features</Text>
      </View>
      <Gap size={10} />
      <View style={styles.detailsCard}>
        {["What's New", "Upgrade to Pro"].map((label, i) => (
          <View key={label}>
            <View style={styles.detailRow}>
              <Skeleton width={120} height={14} borderRadius={4} />
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.neutral[700]}
              />
            </View>
            {i < 1 && <View style={styles.detailDivider} />}
          </View>
        ))}
      </View>

      <Gap size={24} />

      {/* ── Logout button skeleton ──────────────────────── */}
      <Skeleton width="100%" height={50} borderRadius={14} />

      <Gap size={40} />
    </Page>
  );
}

const styles = StyleSheet.create({
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
  statLabel: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
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
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.neutral[700],
    marginHorizontal: 16,
  },
});
