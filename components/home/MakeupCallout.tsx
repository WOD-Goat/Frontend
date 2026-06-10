import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { AssignedWorkoutData } from "@/types";
import { getDayLetter, parseFirebaseDate } from "@/utils";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MakeupCalloutProps {
  workout: AssignedWorkoutData;
  onPress: () => void;
}

export default function MakeupCallout({ workout, onPress }: MakeupCalloutProps) {
  const scheduled = parseFirebaseDate(workout.scheduledFor);
  const dayLetter = getDayLetter(scheduled);
  const dayNum = scheduled.getDate();
  const title = workout.title || "Workout";
  const sourceLabel =
    workout.source === "group" && workout.groupName ? workout.groupName : "Personal";
  const wodCount = workout.wods.length;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {/* Left: large day number + weekday label */}
      <View style={styles.dateCol}>
        <Text style={styles.dayNum}>{dayNum}</Text>
        <Text style={styles.dayLetter}>{dayLetter}</Text>
      </View>

      <View style={styles.divider} />

      {/* Right: workout info */}
      <View style={styles.infoCol}>
        <Text style={styles.missedLabel}>MISSED</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.sub}>
          {sourceLabel} · {wodCount} WOD{wodCount !== 1 ? "s" : ""}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[700],
    borderRadius: responsiveSize(20),
    borderWidth: 1,
    borderColor: Colors.error[500] + "50",
    paddingVertical: responsiveSize(16),
    paddingHorizontal: responsiveSize(20),
    gap: responsiveSize(18),
  },
  dateCol: {
    alignItems: "center",
    minWidth: responsiveSize(44),
  },
  dayNum: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: responsiveSize(38),
    color: Colors.error[500],
    lineHeight: responsiveSize(40),
  },
  dayLetter: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: responsiveSize(11),
    color: Colors.error[500] + "90",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: Colors.error[500] + "30",
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
    gap: responsiveSize(4),
  },
  missedLabel: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(9),
    color: Colors.error[500],
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.inverse,
    lineHeight: responsiveSize(22),
  },
  sub: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
});
