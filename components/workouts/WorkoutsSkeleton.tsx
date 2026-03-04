import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Gap from "../ui/Gap";
import Page from "../ui/Page";
import Skeleton from "../ui/Skeleton";
import WorkoutHeader from "./WorkoutHeader";

/**
 * Skeleton for the Workouts tab — shows the real WorkoutHeader,
 * skeleton stat cards and placeholder workout sections.
 */
export default function WorkoutsSkeleton() {
  return (
    <Page showBackButton={false}>
      <WorkoutHeader />
      <Gap size={16} />

      {/* ── Stats Row skeleton ──────────────────────────── */}
      <View style={styles.statsRow}>
        {[
          {
            icon: "time-outline" as const,
            color: Colors.warning[500],
            label: "Upcoming",
          },
          {
            icon: "checkmark-circle" as const,
            color: Colors.success[500],
            label: "Done",
          },
          {
            icon: "trending-down" as const,
            color: Colors.primary[500],
            label: "Missed",
          },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: stat.color + "20" },
              ]}
            >
              <Ionicons name={stat.icon} size={16} color={stat.color} />
            </View>
            <Skeleton width={28} height={22} borderRadius={6} />
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Gap size={20} />

      {/* ── Workout sections skeleton ───────────────────── */}
      {[0, 1].map((section) => (
        <View key={`section-${section}`}>
          {/* Section header skeleton */}
          <View style={styles.sectionHeader}>
            <Skeleton width={120} height={24} borderRadius={6} />
            <Skeleton width={30} height={20} borderRadius={12} />
          </View>
          <Gap size={10} />
          {/* Workout cards in this section */}
          {[0, 1].map((i) => (
            <View key={`s${section}-w${i}`}>
              <WorkoutSectionSkeleton accentColor={Colors.success[500]} />
              {i < 1 && <Gap size={10} />}
            </View>
          ))}
          <Gap size={20} />
        </View>
      ))}

      <Gap size={24} />
    </Page>
  );
}

/* ── Single workout section skeleton ───────────────────── */
function WorkoutSectionSkeleton({ accentColor }: { accentColor: string }) {
  return (
    <View style={wsStyles.container}>
      <View style={[wsStyles.accent, { backgroundColor: accentColor }]} />
      <View style={wsStyles.body}>
        {/* Top row: date + status badge */}
        <View style={wsStyles.topRow}>
          <View style={wsStyles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.text.secondary}
            />
            <Skeleton width={80} height={12} borderRadius={4} />
          </View>
          <Skeleton width={80} height={22} borderRadius={11} />
        </View>
        {/* WOD card placeholder */}
        <View style={wsStyles.wodPlaceholder}>
          <Skeleton width="70%" height={14} borderRadius={4} />
          <Gap size={8} />
          <Skeleton width="90%" height={10} borderRadius={4} />
          <Gap size={4} />
          <Skeleton width="60%" height={10} borderRadius={4} />
          <Gap size={4} />
          <Skeleton width="80%" height={10} borderRadius={4} />
          <Gap size={4} />
          <Skeleton width="50%" height={10} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    marginTop: -4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

const wsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    overflow: "hidden",
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  wodPlaceholder: {
    paddingTop: 4,
  },
});
