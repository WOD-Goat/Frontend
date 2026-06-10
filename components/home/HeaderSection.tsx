import images from "@/assets/images";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface HeaderSectionProps {
  userName: string;
  streakDays?: number;
  weekLabel?: string;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const getMotivation = (): string => {
  const lines = [
    "It's time to challenge your limits.",
    "Push harder than yesterday.",
    "Every rep counts. Let's go!",
    "Your only limit is you.",
    "Make today count.",
  ];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return lines[dayOfYear % lines.length];
};

export default function HeaderSection({
  userName,
  streakDays = 0,
  weekLabel,
}: HeaderSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.greetingSection}>
          <Text style={styles.greetingLabel}>{getGreeting()}</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.motivation}>{weekLabel ?? getMotivation()}</Text>
        </View>

        <View style={[styles.streakChip, streakDays > 0 ? styles.streakActive : styles.streakInactive]}>
          <Image
            source={streakDays > 0 ? images["active-streak"] : images["inactive-streak"]}
            style={styles.streakIcon}
          />
          <Text style={[styles.streakNumber, streakDays > 0 && { color: Colors.primary[500] }]}>
            {streakDays}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetingSection: {
    flex: 1,
    marginRight: 12,
  },
  greetingLabel: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  userName: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.inverse,
    lineHeight: 28,
    marginBottom: 4,
  },
  motivation: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  // Streak chip
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 2,
  },
  streakActive: {
    backgroundColor: Colors.primary[500] + "18",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "45",
  },
  streakInactive: {
    backgroundColor: Colors.secondary[600],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  streakIcon: {
    width: 18,
    height: 18,
  },
  streakNumber: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.secondary,
    lineHeight: FontSizes.headingMD * 1.1,
  },
});
