import images from "@/assets/images";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface HeaderSectionProps {
  userName: string;
  streakDays?: number;
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
  // Pick one based on day-of-year so it changes daily but stays stable
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return lines[dayOfYear % lines.length];
};

export default function HeaderSection({
  userName,
  streakDays = 0,
}: HeaderSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.greetingSection}>
        <Text style={styles.greetingLabel}>{getGreeting()}</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.motivation}>{getMotivation()}</Text>
      </View>

      {/* Streak Badge */}
      <View
        style={[
          styles.streakCard,
          streakDays > 0 ? styles.streakActive : styles.streakInactive,
        ]}
      >
        <Image
          source={
            streakDays > 0 ? images["active-streak"] : images["inactive-streak"]
          }
          style={styles.streakIcon}
        />
        <Text
          style={[
            styles.streakValue,
            streakDays > 0 && { color: Colors.primary[500] },
          ]}
        >
          {streakDays}
        </Text>
        <Text style={styles.streakLabel}>
          {streakDays === 1 ? "Day" : "Days"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  greetingSection: {
    flex: 1,
    marginRight: 16,
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
    marginBottom: 4,
  },
  motivation: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    lineHeight: 18,
  },

  // Streak card
  streakCard: {
    alignItems: "center",
    justifyContent: "center",
    width: 68,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 2,
  },
  streakActive: {
    backgroundColor: Colors.primary[500] + "18",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "50",
  },
  streakInactive: {
    backgroundColor: Colors.secondary[600],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  streakIcon: {
    width: 24,
    height: 24,
  },
  streakValue: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  streakLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: -2,
  },
});
