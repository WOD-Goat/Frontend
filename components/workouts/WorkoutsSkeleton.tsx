import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Gap from "../ui/Gap";
import Page from "../ui/Page";
import Skeleton from "../ui/Skeleton";
import { HeaderSection } from "../home";

export default function WorkoutsSkeleton({ userName, user }: { userName: string; user: any }) {
  return (
    <Page showBackButton={false}>
      <HeaderSection
        userName={userName}
        streakDays={user?.statsSummary.currentStreak}
      />

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Skeleton width={36} height={24} borderRadius={6} />
          <Text style={styles.statLbl}>Upcoming</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Skeleton width={36} height={24} borderRadius={6} />
          <Text style={styles.statLbl}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Skeleton width={36} height={24} borderRadius={6} />
          <Text style={styles.statLbl}>Longest Streak</Text>
        </View>
      </View>

      <Gap size={20} />

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        scrollEnabled={false}
      >
        {[72, 84, 68, 72].map((w, i) => (
          <Skeleton key={i} width={w} height={34} borderRadius={20} />
        ))}
      </ScrollView>

      <Gap size={16} />

      {/* Workout section cards */}
      {[0, 1, 2].map((i) => (
        <View key={i}>
          <WorkoutSectionSkeleton />
          {i < 2 && <Gap size={10} />}
        </View>
      ))}
    </Page>
  );
}

function WorkoutSectionSkeleton() {
  return (
    <View style={wsStyles.container}>
      <View style={wsStyles.accent} />
      <View style={wsStyles.body}>
        <View style={wsStyles.topRow}>
          <View style={wsStyles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.text.secondary} />
            <Skeleton width={80} height={12} borderRadius={4} />
          </View>
          <Skeleton width={80} height={22} borderRadius={11} />
        </View>
        <View style={wsStyles.wodPlaceholder}>
          <Skeleton width="70%" height={14} borderRadius={4} />
          <Gap size={8} />
          <Skeleton width="90%" height={10} borderRadius={4} />
          <Gap size={4} />
          <Skeleton width="60%" height={10} borderRadius={4} />
          <Gap size={4} />
          <Skeleton width="80%" height={10} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsStrip: {
    flexDirection: "row",
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLbl: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
    backgroundColor: Colors.neutral[700],
  },
  tabsRow: {
    gap: 8,
    paddingHorizontal: 2,
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
    backgroundColor: Colors.primary[500] + "60",
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
