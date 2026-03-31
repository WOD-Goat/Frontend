import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import WorkoutCard from "./WorkoutCard";

export type WorkoutStatus = "not-started-yet" | "completed" | "missed";

interface WOD {
  id: string;
  title: string;
  exercises: string[];
  rawText?: string;
}

interface WorkoutSectionProps {
  date: string;
  status: WorkoutStatus;
  wods: WOD[];
  workoutType?: string;
  workoutId: string;
  source?: "personal" | "group";
  groupId?: string;
  groupName?: string;
  hasSubmitted?: boolean;
  locked?: boolean;
  onLockedPress?: () => void;
}

const STATUS_CONFIG = {
  "not-started-yet": {
    label: "Upcoming",
    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
    color: Colors.warning[500],
    bgColor: Colors.warning[500] + "18",
  },
  completed: {
    label: "Completed",
    icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
    color: Colors.success[500],
    bgColor: Colors.success[500] + "18",
  },
  missed: {
    label: "Missed",
    icon: "trending-down" as keyof typeof Ionicons.glyphMap,
    color: Colors.error[500],
    bgColor: Colors.error[500] + "18",
  },
};


export default function WorkoutSection({
  date,
  status,
  wods,
  workoutId,
  source = "personal",
  groupId,
  groupName,
  hasSubmitted,
  locked = false,
  onLockedPress,
}: WorkoutSectionProps) {
  const config = STATUS_CONFIG[status];
  const isGroup = source === "group";
  const isGroupDone = isGroup && hasSubmitted;
  const isGroupMissed = isGroup && status === "missed";
  const accentColor = locked
    ? Colors.primary[500]
    : isGroupDone
    ? Colors.success[500]
    : isGroupMissed
    ? Colors.error[500]
    : isGroup
    ? Colors.primary[500]
    : config.color;

  const navigateToWorkout = () => {
    if (locked) {
      onLockedPress?.();
      return;
    }
    if (isGroup && groupId) {
      router.push(`/group/workout/${workoutId}?groupId=${groupId}`);
    } else {
      router.push(`/workout/${workoutId}`);
    }
  };

  return (
    <View style={[styles.container, locked && styles.containerLocked]}>
      {/* Left accent */}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* Top row: date + status badge + optional group badge — tappable */}
        <Pressable onPress={navigateToWorkout}>
          <View style={styles.topRow}>
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={Colors.text.secondary}
              />
              <Text style={styles.date}>{date}</Text>
              {isGroup && groupName && (
                <View style={[styles.groupPill, { backgroundColor: Colors.primary[500] + "20" }]}>
                  {locked
                    ? <Ionicons name="lock-closed" size={10} color={Colors.primary[400]} />
                    : <Ionicons name="people" size={10} color={isGroupDone ? Colors.success[500] : Colors.primary[500]} />
                  }
                  <Text style={[styles.groupPillText, { color: locked ? Colors.primary[400] : isGroupDone ? Colors.success[500] : Colors.primary[500] }]}>{groupName}</Text>
                </View>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: locked ? Colors.primary[500] + "18" : isGroupDone ? Colors.success[500] + "18" : isGroup ? Colors.primary[500] + "18" : config.bgColor }]}>
              <Ionicons
                name={locked ? "lock-closed" : isGroupDone ? "checkmark-circle" : isGroup ? "people" : config.icon}
                size={12}
                color={locked ? Colors.primary[400] : isGroupDone ? Colors.success[500] : isGroup ? Colors.primary[500] : config.color}
              />
              <Text style={[styles.statusText, { color: locked ? Colors.primary[400] : isGroupDone ? Colors.success[500] : isGroup ? Colors.primary[500] : config.color }]}>
                {locked ? "Locked" : isGroup ? "Group" : config.label}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* WODs horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={styles.wodsScroll}
        >
          {wods.map((wod, index) => (
            <React.Fragment key={wod.id}>
              <WorkoutCard title={wod.title} exercises={wod.exercises} rawText={wod.rawText} />
              {index < wods.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </ScrollView>

        {/* Bottom row: wod count + chevron — tappable */}
        <Pressable onPress={navigateToWorkout}>
          <View style={styles.bottomRow}>
            <View style={styles.wodCountPill}>
              <Ionicons
                name="layers-outline"
                size={12}
                color={Colors.text.secondary}
              />
              <Text style={styles.wodCountText}>
                {wods.length} WOD{wods.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.viewRow}>
              <Text style={styles.viewText}>
                {locked ? "Upgrade to unlock" : "View Details"}
              </Text>
              <Ionicons
                name={locked ? "star" : "chevron-forward"}
                size={16}
                color={Colors.primary[500]}
              />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.secondary[500],
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  containerCompleted: {
    opacity: 0.75,
  },
  containerLocked: {
    opacity: 0.55,
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  groupPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  groupPillText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: 9,
    color: Colors.primary[500],
  },
  date: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.inverse,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.bodyXS,
  },
  wodsScroll: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 8,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: Colors.neutral[700],
    marginVertical: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
    marginHorizontal: 8,
  },
  wodCountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  wodCountText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodyXS,
    color: Colors.primary[500],
  },
});
