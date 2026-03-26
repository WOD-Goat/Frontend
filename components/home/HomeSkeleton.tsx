import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Gap from "../ui/Gap";
import Page from "../ui/Page";
import Skeleton from "../ui/Skeleton";

/**
 * Skeleton for the Home tab — mirrors HeaderSection, WODCard,
 * BannerCarousel section header, and StatsCard layout.
 */
export default function HomeSkeleton() {
  return (
    <Page showBackButton={false}>
      {/* ── Header Section skeleton ─────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Skeleton width={120} height={12} borderRadius={4} />
          <Gap size={6} />
          <Skeleton width={180} height={24} borderRadius={6} />
          <Gap size={6} />
          <Skeleton width={220} height={12} borderRadius={4} />
        </View>
        {/* Streak badge skeleton */}
        <Skeleton width={56} height={72} borderRadius={14} />
      </View>

      <Gap size={20} />

      {/* ── WOD Card skeleton ───────────────────────────── */}
      <View style={styles.wodCard}>
        <View style={styles.wodContent}>
          <Skeleton
            width={72}
            height={72}
            borderRadius={36}
            style={{ flexShrink: 0 }}
          />
          <View style={styles.wodText}>
            <Skeleton width="80%" height={16} borderRadius={6} />
            <Gap size={6} />
            <Skeleton width="60%" height={12} borderRadius={4} />
          </View>
          <Skeleton width={36} height={36} borderRadius={18} />
        </View>
      </View>

      <Gap size={24} />

      {/* ── Banner Carousel section header + placeholder ── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="sparkles" size={18} color={Colors.primary[500]} />
        <Text style={styles.sectionTitle}>WODGoat AI</Text>
      </View>
      <Gap size={12} />
      <Skeleton width="100%" height={150} borderRadius={18} />

      <Gap size={24} />

      {/* ── Stats Card skeleton ─────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="stats-chart" size={18} color={Colors.primary[500]} />
        <Text style={styles.sectionTitle}>Latest Performance</Text>
      </View>
      <Gap size={12} />
      <View style={styles.statsGrid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.statCard}>
            <Skeleton width={42} height={42} borderRadius={14} />
            <Gap size={8} />
            <Skeleton width={48} height={18} borderRadius={6} />
            <Gap size={4} />
            <Skeleton width={60} height={10} borderRadius={4} />
          </View>
        ))}
      </View>

      <Gap size={24} />
    </Page>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  wodCard: {
    backgroundColor: Colors.secondary[500],
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "35",
  },
  wodContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  wodText: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
});
