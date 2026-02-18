import { Colors, FontFamilies, FontSizes } from "@/constants";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import WorkoutCard from "./WorkoutCard";

export type WorkoutStatus = "in-progress" | "completed";

interface Workout {
  id: string;
  title: string;
  exercises: string[];
}

interface WorkoutDateSectionProps {
  date: string;
  status: WorkoutStatus;
  workouts: Workout[];
}

export default function WorkoutDateSection({
  date,
  status,
  workouts,
}: WorkoutDateSectionProps) {
  const statusConfig = {
    "in-progress": {
      label: "In Progress ⌛",
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
          <Text style={styles.statusText}>Status: {statusLabel}</Text>
        </View>
        <Pressable onPress={() => console.log("View workout pressed")}>
          <Text style={styles.viewWorkoutLink}>View Workout</Text>
        </Pressable>
      </View>
      <View style={styles.scrollViewWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={workouts.length > 1}
          contentContainerStyle={styles.workoutsContainer}
        >
          {workouts.map((workout, index) => (
            <React.Fragment key={workout.id}>
              <WorkoutCard
                title={workout.title}
                exercises={workout.exercises}
              />
              {index < workouts.length - 1 && <View style={styles.divider} />}
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
  workoutsContainer: {
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
