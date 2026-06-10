import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { AssignedWorkoutData } from "@/types";
import { parseFirebaseDate } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DayWorkoutCardProps {
  workout: AssignedWorkoutData | null;
  selectedDate: Date;
  isToday: boolean;
  showEyebrow?: boolean;
}

type WorkoutStatus = "not-started-yet" | "completed" | "missed";

const STATUS_CONFIG: Record<WorkoutStatus, { label: string; color: string }> = {
  "not-started-yet": { label: "UPCOMING", color: Colors.primary[500] },
  completed:         { label: "COMPLETED", color: Colors.success[500] },
  missed:            { label: "MISSED",    color: Colors.error[500] },
};

function getStatus(workout: AssignedWorkoutData): WorkoutStatus {
  const done = workout.source === "group" ? workout.hasSubmitted : workout.completed;
  if (done) return "completed";
  const scheduled = parseFirebaseDate(workout.scheduledFor);
  if (scheduled.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) return "missed";
  return "not-started-yet";
}

function getWodBody(workout: AssignedWorkoutData, wodIndex: number): string {
  const wod = workout.wods[wodIndex];
  if (!wod) return "";
  if (wod.rawText) return wod.rawText;
  return wod.exercises.map((e) => e.name).join("\n");
}

function isBodyLong(workout: AssignedWorkoutData, wodIndex: number): boolean {
  const wod = workout.wods[wodIndex];
  if (!wod) return false;
  if (wod.rawText) return wod.rawText.split("\n").length > 5 || wod.rawText.length > 180;
  return wod.exercises.length > 5;
}

export default function DayWorkoutCard({ workout, selectedDate, isToday, showEyebrow = true }: DayWorkoutCardProps) {
  const dayLabel = isToday
    ? "Today"
    : selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (!workout) {
    const restChips = ["Mobility 10m", "Walk", "Stretch", "Sleep 8h"];
    return (
      <View>
        {showEyebrow && (
          <View style={styles.eyebrow}>
            <Text style={styles.eyebrowDay}>
              {dayLabel} <Text style={styles.eyebrowDate}>{dateLabel}</Text>
            </Text>
            <View style={styles.restPill}>
              <View style={styles.restPillDot} />
              <Text style={styles.restPillText}>REST DAY</Text>
            </View>
          </View>
        )}

        {/* Rest card */}
        <View style={[styles.card, { borderColor: Colors.neutral[700] }]}>
          {/* Moon icon circle */}
          <View style={styles.restIconRing}>
            <Ionicons name="moon" size={responsiveSize(28)} color={Colors.text.secondary} />
          </View>

          <Text style={styles.restTitle}>Rest day</Text>
          <Text style={styles.restSubtitle}>
            No workout scheduled. Recovery is part of the plan — let your body rebuild.
          </Text>

          {/* Suggestion chips */}
          <View style={styles.chipsRow}>
            {restChips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  const status = getStatus(workout);
  const statusCfg = STATUS_CONFIG[status];
  const sc = statusCfg.color;
  const visibleWods = workout.wods.slice(0, 2);
  const extraCount = workout.wods.length - 2;
  const sourceLabel =
    workout.source === "group" && workout.groupName ? workout.groupName : "Personal";

  const navigateToWorkout = () => {
    if (workout.source === "group" && workout.groupId) {
      router.push(`/group/workout/${workout.id}?groupId=${workout.groupId}` as any);
    } else {
      router.push(`/workout/${workout.id}` as any);
    }
  };

  const cardBorderColor =
    status === "completed" ? Colors.success[500] + "55" :
    status === "missed"    ? Colors.error[500]   + "55" :
    "rgba(255,106,26,0.42)";

  return (
    <View>
      {showEyebrow && (
        <View style={styles.eyebrow}>
          <Text style={styles.eyebrowDay}>
            {dayLabel} · <Text style={styles.eyebrowDate}>{dateLabel}</Text>
          </Text>
          <View style={[styles.statusPill, { backgroundColor: sc + "20" }]}>
            <Text style={[styles.statusText, { color: sc }]}>{statusCfg.label}</Text>
          </View>
        </View>
      )}

      {/* Card body */}
      <Pressable onPress={navigateToWorkout} style={[styles.card, { borderColor: cardBorderColor }]}>
        {/* Title + sub-line */}
        <Text style={styles.title} numberOfLines={2}>
          {workout.title || "Workout"}
        </Text>
        <Text style={styles.subLine}>
          {sourceLabel} · {workout.wods.length} WOD{workout.wods.length !== 1 ? "s" : ""}
        </Text>

        <View style={styles.divider} />

        {/* WOD rows */}
        {visibleWods.map((wod, i) => (
          <View key={i}>
            <View style={styles.wodRow}>
              <Text style={[styles.wodNumeral, { color: sc }]}>
                {String(i + 1).padStart(2, "0")}
              </Text>
              <View style={styles.wodBody}>
                <Text style={styles.wodName}>{wod.name || "WOD"}</Text>
                <Text style={styles.wodBodyText} numberOfLines={5}>
                  {getWodBody(workout, i)}
                </Text>
                {isBodyLong(workout, i) && (
                  <Text style={[styles.truncHint, { color: sc + "80" }]}>···</Text>
                )}
              </View>
            </View>
            {i < visibleWods.length - 1 && (
              <View style={[styles.wodSeparator, { backgroundColor: sc + "25" }]} />
            )}
          </View>
        ))}

        {/* "+ N more" in numeral column */}
        {extraCount > 0 && (
          <View style={styles.wodRow}>
            <Text style={[styles.wodNumeral, { color: sc + "70" }]}>
              +{extraCount}
            </Text>
            <View style={[styles.wodBody, { justifyContent: "center" }]}>
              <Text style={[styles.moreLabel, { color: sc + "70" }]}>
                more WOD{extraCount !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        )}

        {/* View details footer */}
        <View style={[styles.footer, { borderTopColor: sc + "30" }]}>
          <Text style={[styles.footerText, { color: sc }]}>View details</Text>
          <Ionicons name="chevron-forward" size={13} color={sc} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveSize(10),
    paddingHorizontal: responsiveSize(2),
  },
  eyebrowDay: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.inverse,
  },
  eyebrowDate: {
    fontFamily: FontFamilies.spartanRegular,
    color: Colors.text.secondary,
  },
  statusPill: {
    paddingHorizontal: responsiveSize(10),
    paddingVertical: responsiveSize(4),
    borderRadius: responsiveSize(20),
  },
  statusText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.bodyXS,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.secondary[700],
    borderRadius: responsiveSize(22),
    borderWidth: 1,
    padding: responsiveSize(20),
    gap: responsiveSize(8),
  },
  restPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize(5),
    backgroundColor: Colors.neutral[800],
    borderRadius: responsiveSize(20),
    paddingHorizontal: responsiveSize(10),
    paddingVertical: responsiveSize(5),
  },
  restPillDot: {
    width: responsiveSize(6),
    height: responsiveSize(6),
    borderRadius: responsiveSize(3),
    backgroundColor: Colors.text.secondary,
  },
  restPillText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(10),
    color: Colors.text.secondary,
    letterSpacing: 0.8,
  },
  restIconRing: {
    width: responsiveSize(64),
    height: responsiveSize(64),
    borderRadius: responsiveSize(32),
    backgroundColor: Colors.neutral[800],
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: responsiveSize(8),
    marginBottom: responsiveSize(4),
  },
  restTitle: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(22),
    color: Colors.text.inverse,
    textAlign: "center",
  },
  restSubtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(13),
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: responsiveSize(20),
    paddingHorizontal: responsiveSize(8),
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: responsiveSize(8),
    marginTop: responsiveSize(6),
    marginBottom: responsiveSize(8),
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: responsiveSize(20),
    paddingHorizontal: responsiveSize(12),
    paddingVertical: responsiveSize(6),
  },
  chipText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(12),
    color: Colors.text.secondary,
  },
  title: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(22),
    color: Colors.text.inverse,
    lineHeight: responsiveSize(28),
  },
  subLine: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(13),
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[700],
    marginVertical: responsiveSize(4),
  },
  wodRow: {
    flexDirection: "row",
    gap: responsiveSize(8),
    alignItems: "flex-start",
  },
  wodNumeral: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: responsiveSize(32),
    lineHeight: responsiveSize(36),
    width: responsiveSize(44),
  },
  wodBody: {
    flex: 1,
    paddingTop: responsiveSize(4),
    gap: responsiveSize(4),
  },
  wodName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(15),
    color: Colors.text.inverse,
  },
  wodBodyText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(13),
    color: Colors.text.secondary,
    lineHeight: responsiveSize(20),
  },
  truncHint: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(13),
    letterSpacing: 2,
  },
  wodSeparator: {
    height: 1,
    marginVertical: responsiveSize(10),
    marginLeft: responsiveSize(52),
  },
  moreLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    paddingTop: responsiveSize(6),
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: responsiveSize(2),
    borderTopWidth: 1,
    paddingTop: responsiveSize(10),
    marginTop: responsiveSize(2),
  },
  footerText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodyXS,
  },
});
