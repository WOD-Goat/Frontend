import { Colors, FontFamilies, FontSizes } from "@/constants";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import WorkoutCard from "./WorkoutCard";

export type WorkoutStatus = "not-started-yet" | "completed";

interface WOD {
  id: string;
  title: string;
  exercises: string[];
}

interface WorkoutSectionProps {
  date: string;
  status: WorkoutStatus;
  wods: WOD[];
  workoutType?: string;
  workoutId: string;
}

export default function WorkoutSection({
  date,
  status,
  workoutType = "Workout",
  wods,
  workoutId,
}: WorkoutSectionProps) {
  const statusConfig = {
    "not-started-yet": {
      label: "Not Started Yet ⏳",
    },
    completed: {
      label: "Completed ✅",
    },
  };

  const statusLabel = statusConfig[status].label;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
        <Pressable
        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
          onPress={() => {
            console.log("Navigating to workout with ID:", workoutId);
            router.push(`/workout/${workoutId}`);
          }}
        >
          <Text style={styles.viewWorkoutLink}>View Workout</Text>
        </Pressable>
      </View>
      <View style={styles.scrollViewWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={wods.length > 1}
          contentContainerStyle={styles.wodsContainer}
        >
          {wods.map((wod, index) => (
            <React.Fragment key={wod.id}>
              <WorkoutCard title={wod.title} exercises={wod.exercises} />
              {index < wods.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  date: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
  },
  statusText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.inverse,
  },
  viewWorkoutLink: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
    textDecorationLine: "underline",
  },
  scrollViewWrapper: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
  },
  wodsContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  divider: {
    width: 1,
    height: "90%",
    backgroundColor: "#6B6B6B",
    marginHorizontal: 16,
  },
});
