import { workoutsService } from "@/api/services";
import { Gap, Page, WorkoutHeader, WorkoutSection } from "@/components";
import { Colors } from "@/constants";
import type { AssignedWorkoutData } from "@/types";
import { formatDate, parseFirebaseDate } from "@/utils";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface WorkoutSection {
  date: string;
  status: "not-started-yet" | "completed";
  workoutId: string; // Single workout session ID
  wods: {
    // WODs within this workout session
    id: string;
    title: string;
    exercises: string[];
  }[];
  workoutType: string;
}

export default function WorkoutsScreen() {
  const [workoutSections, setWorkoutSections] = useState<WorkoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workoutsService.getAllWorkouts();

      if (response.success && response.data) {
        const sections = transformWorkoutsToSections(response.data);
        setWorkoutSections(sections);
      } else {
        setError(response.message || "Failed to load workouts");
      }
    } catch (err: any) {
      console.error("Error loading workouts:", err);
      setError(err.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  const transformWorkoutsToSections = (
    workouts: AssignedWorkoutData[],
  ): WorkoutSection[] => {
    // Create one section per workout (no grouping by date)
    return workouts.map((workout) => {
      const dateObj = parseFirebaseDate(workout.scheduledFor);
      const date = formatDate(dateObj);

      return {
        date,
        status: workout.completed ? "completed" : "not-started-yet",
        workoutType: workout.wods[0]?.name || "Workout",
        workoutId: workout.id || "",
        // Map WODs within this workout session
        wods: workout.wods.map((wod, wodIndex) => ({
          id: `${workout.id || ""}-wod-${wodIndex}`,
          title: wod.name || "Untitled WOD",
          exercises: wod.exercises.map((ex) => ex.name),
        })),
      };
    });
  };

  if (loading) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <WorkoutHeader />
        <Gap size={26} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <WorkoutHeader />
        <Gap size={26} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Page>
    );
  }

  if (workoutSections.length === 0) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <WorkoutHeader />
        <Gap size={26} />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No workouts found</Text>
          <Text style={styles.emptySubtext}>
            Create your first workout to get started!
          </Text>
        </View>
      </Page>
    );
  }

  return (
    <Page showBackButton={false}>
      <WorkoutHeader />
      <Gap size={26} />

      {workoutSections.map((section, index) => (
        <WorkoutSection
          key={index}
          date={section.date}
          status={section.status}
          wods={section.wods}
          workoutType={section.workoutType}
          workoutId={section.workoutId}
        />
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.secondary,
    fontSize: 14,
  },
  errorText: {
    color: Colors.error[500],
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    color: Colors.text.secondary,
    fontSize: 14,
    textAlign: "center",
  },
});
