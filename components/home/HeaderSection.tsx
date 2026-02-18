import images from "@/assets/images";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface HeaderSectionProps {
  userName: string;
  streakDays?: number;
}

export default function HeaderSection({
  userName,
  streakDays = 0,
}: HeaderSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hi, {userName} 👋</Text>
        <Text style={styles.subtitle}>It's time to challenge your limits.</Text>
      </View>
      <View style={styles.streakContainer}>
        <Image
          source={
            streakDays > 0 ? images["active-streak"] : images["inactive-streak"]
          }
          style={styles.streakIcon}
        />
        {streakDays > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{streakDays}</Text>
          </View>
        )}
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
    paddingRight: 16,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  streakContainer: {
    position: "relative",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  streakIcon: {
    width: 32,
    height: 32,
  },
  streakBadge: {
    position: "absolute",
    top: -4,
    left: 24,
    // backgroundColor: Colors.primary[500],
    borderRadius: 12,

    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  streakNumber: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: 14,
    color: Colors.text.inverse,
    lineHeight: 20,
  },
});
