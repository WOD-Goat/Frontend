import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Gap from "../ui/Gap";
import Page from "../ui/Page";
import Skeleton from "../ui/Skeleton";
import PRHeader from "./PRHeader";

/**
 * Skeleton for the PRs tab — shows the real PRHeader,
 * search bar placeholder, stat cards, hero card, and PR list items.
 */
export default function PRsSkeleton() {
  return (
    <Page showBackButton={false}>
      <PRHeader />

      {/* ── Search bar skeleton ─────────────────────────── */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color={Colors.text.tertiary}
          style={styles.searchIcon}
        />
        <Skeleton width="80%" height={16} borderRadius={6} />
      </View>

      <Gap size={24} />

      {/* ── Stats Row skeleton ──────────────────────────── */}
      <View style={styles.statsRow}>
        {[
          {
            icon: "trophy" as const,
            color: Colors.primary[500],
            label: "Total PRs",
          },
          {
            icon: "trending-up" as const,
            color: Colors.success[500],
            label: "Improved",
          },
          {
            icon: "flame" as const,
            color: Colors.fitness.flexibility,
            label: "Latest",
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
            <Skeleton width={32} height={22} borderRadius={6} />
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Gap size={20} />

      {/* ── Hero Card skeleton (Latest Record) ──────────── */}
      <View style={styles.rowCenter}>
        <Ionicons name="star" size={18} color={Colors.primary[500]} />
        <Text style={styles.sectionTitle}>Latest Record</Text>
      </View>
      <Gap size={10} />
      <View style={styles.heroCard}>
        <View style={styles.heroAccent} />
        <View style={styles.heroBody}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={styles.heroNameRow}>
                <Skeleton width={28} height={28} borderRadius={14} />
                <Skeleton width={140} height={16} borderRadius={6} />
              </View>
              <View style={styles.heroDateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={Colors.text.secondary}
                />
                <Skeleton width={70} height={10} borderRadius={4} />
              </View>
            </View>
            <View style={{ alignItems: "flex-end", gap: 2 }}>
              <Skeleton width={48} height={28} borderRadius={6} />
              <Skeleton width={24} height={10} borderRadius={4} />
            </View>
          </View>
        </View>
      </View>

      <Gap size={24} />

      {/* ── All Records list skeleton ───────────────────── */}
      <View style={styles.rowCenter}>
        <Ionicons name="list" size={16} color={Colors.text.secondary} />
        <Text style={styles.sectionTitle}>All Records</Text>
      </View>
      <Gap size={10} />
      {[0, 1, 2, 3].map((i) => (
        <View key={i}>
          <PRCardSkeleton />
          {i < 3 && <Gap size={10} />}
        </View>
      ))}

      <Gap size={24} />
    </Page>
  );
}

/* ── Single PR card skeleton ──────────────────────────── */
function PRCardSkeleton() {
  return (
    <View style={prStyles.card}>
      <View style={prStyles.accent} />
      <Skeleton width={40} height={40} borderRadius={12} />
      <View style={prStyles.body}>
        <Skeleton width="70%" height={14} borderRadius={4} />
        <Gap size={4} />
        <Skeleton width="45%" height={10} borderRadius={4} />
      </View>
      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <Skeleton width={36} height={18} borderRadius={6} />
        <Skeleton width={20} height={8} borderRadius={4} />
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.neutral[700]}
        style={{ marginLeft: 8 }}
      />
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[600],
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    marginTop: -4,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  heroCard: {
    flexDirection: "row",
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    overflow: "hidden",
  },
  heroAccent: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: Colors.primary[500],
  },
  heroBody: {
    flex: 1,
    padding: 16,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

const prStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    overflow: "hidden",
    paddingRight: 14,
    paddingVertical: 14,
    gap: 12,
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: Colors.neutral[700],
  },
  body: {
    flex: 1,
  },
});
