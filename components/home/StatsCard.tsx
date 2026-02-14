import { icons } from "@/assets/images";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface StatItem {
  icon: string;
  value: string;
  label: string;
}

interface StatsCardProps {
  title?: string;
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  { icon: icons["active-streak"], value: "3 Day", label: "Streak" },
  { icon: icons.dumbell, value: "120KG", label: "Backsquat PR" },
  { icon: icons.trophy, value: "4 PRs", label: "This month" },
  { icon: icons.star, value: "Favorite", label: "Squat Cleans" },
];

export default function StatsCard({
  title = "Latest Performance",
  stats = defaultStats,
}: StatsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statItem,
              index % 2 === 0 && styles.leftBorder,
              index < 2 && styles.topBorder,
            ]}
          >
            <Image style={styles.icon} source={stat.icon} />
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
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
  title: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingXL,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  statsContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
  },
  statItem: {
    width: "50%",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.primary[500],
  },
  leftBorder: {
    borderRightWidth: 1,
  },
  topBorder: {
    borderBottomWidth: 1,
  },
  icon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  value: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.heading2XL,
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  label: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
  },
});
