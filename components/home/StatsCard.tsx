import { icons } from "@/assets/images";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface StatItem {
  icon: string;
  ionIcon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  value: string;
  label: string;
}

interface StatsCardProps {
  user: User | null;
  title?: string;
  stats?: StatItem[];
}

export default function StatsCard({
  user,
  title = "Latest Performance",
}: StatsCardProps) {
  const stats: StatItem[] = [
    {
      icon: icons["active-streak"],
      ionIcon: "flame",
      iconColor: Colors.primary[500],
      value: `${user?.statsSummary?.currentStreak || 0} ${user?.statsSummary?.currentStreak === 1 ? "Day" : "Days"}`,
      label: "Streak",
    },
    {
      icon: icons.dumbell,
      ionIcon: "barbell",
      iconColor: Colors.fitness.strength,
      value: `${user?.statsSummary?.latestPR.value || 0}`,
      label: user?.statsSummary?.latestPR.exerciseName || "Latest PR",
    },
    {
      icon: icons.trophy,
      ionIcon: "trophy",
      iconColor: Colors.warning[500],
      value: `${user?.statsSummary?.totalPRs || 0}`,
      label: "Total PRs",
    },
    {
      icon: icons.star,
      ionIcon: "heart",
      iconColor: Colors.fitness.cardio,
      value: "Favorite",
      label: "Squat Cleans",
    },
  ];
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons name="stats-chart" size={18} color={Colors.primary[500]} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View
              style={[
                styles.iconBg,
                {
                  backgroundColor:
                    (stat.iconColor || Colors.primary[500]) + "18",
                },
              ]}
            >
              {stat.ionIcon ? (
                <Ionicons
                  name={stat.ionIcon}
                  size={20}
                  color={stat.iconColor || Colors.primary[500]}
                />
              ) : (
                <Image style={styles.icon} source={stat.icon} />
              )}
            </View>
            <Text style={styles.value} numberOfLines={1}>
              {stat.value}
            </Text>
            <Text style={styles.label} numberOfLines={1}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
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
    gap: 8,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 22,
    height: 22,
  },
  value: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.inverse,
    textAlign: "center",
  },
  label: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: -4,
  },
});
