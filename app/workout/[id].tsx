import { workoutsService } from "@/api/services";
import { Button, Page } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { AssignedWorkoutData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Exercise {
  name: string;
  details?: string[];
}

interface WOD {
  id: string;
  title: string;
  exercises: Exercise[];
  completed: boolean;
}

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams();
  const { id } = params;

  const [workout, setWorkout] = useState<AssignedWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wods, setWods] = useState<WOD[]>([]);

  const [expandedExercises, setExpandedExercises] = useState<{
    [key: string]: boolean;
  }>({});

  // Animated values for completion button transitions
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

  // Fetch workout data
  useEffect(() => {
    if (id && typeof id === "string") {
      loadWorkout(id);
    }
  }, [id]);

  const loadWorkout = async (workoutId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workoutsService.getWorkoutById(workoutId);

      if (response.success && response.data) {
        setWorkout(response.data);

        // Transform workout data to WOD format for the UI
        const transformedWods: WOD[] = response.data.wods.map((wod, index) => ({
          id: `wod-${index}`,
          title: wod.name,
          exercises: wod.exercises.map((ex) => ({
            name: ex.name,
            details: ex.description ? [ex.description] : undefined,
          })),
          completed: false, // You can track this separately or add to backend
        }));

        setWods(transformedWods);
      } else {
        setError(response.message || "Failed to load workout");
      }
    } catch (err: any) {
      console.error("Error loading workout:", err);
      setError(err.message || "Failed to load workout");
    } finally {
      setLoading(false);
    }
  };

  // Initialize animated values for each WOD
  wods.forEach((wod) => {
    if (!animatedValues.current[wod.id]) {
      animatedValues.current[wod.id] = new Animated.Value(
        wod.completed ? 1 : 0,
      );
    }
  });

  const toggleExercise = (wodId: string, exerciseIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const key = `${wodId}-${exerciseIndex}`;
    setExpandedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleWODCompletion = (wodId: string) => {
    const wod = wods.find((w) => w.id === wodId);
    if (!wod) return;

    const toValue = wod.completed ? 0 : 1;

    Animated.timing(animatedValues.current[wodId], {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setWods((prev) =>
      prev.map((wod) =>
        wod.id === wodId ? { ...wod, completed: !wod.completed } : wod,
      ),
    );
  };

  if (loading) {
    return (
      <Page
        title="Workout Details"
        scrollable={false}
        contentStyle={{ flex: 1 }}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        title="Workout Details"
        scrollable={false}
        contentStyle={{ flex: 1 }}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={{ marginTop: 16 }}>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </View>
      </Page>
    );
  }

  if (!workout || wods.length === 0) {
    return (
      <Page
        title="Workout Details"
        scrollable={false}
        contentStyle={{ flex: 1 }}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <View style={{ marginTop: 16 }}>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </View>
      </Page>
    );
  }

  return (
    <Page
      title="Workout Details"
      footer={
        <Button
          title="Complete Workout"
          size="large"
          disabled={wods.some((wod) => !wod.completed)}
          onPress={() => {
            // Pass workout data through router params
            router.push({
              pathname: `/workout/results`,
              params: {
                workoutData: JSON.stringify(workout),
              },
            });
          }}
        />
      }
    >
      {wods.map((wod) => (
        <View key={wod.id} style={styles.wodContainer}>
          {/* WOD Header */}
          <View style={styles.wodHeader}>
            <Text style={styles.wodTitle}>{wod.title}</Text>
            <TouchableOpacity
              style={[
                styles.completionButton,
                wod.completed && styles.completionButtonActive,
              ]}
              onPress={() => toggleWODCompletion(wod.id)}
            >
              <Animated.View
                style={[
                  styles.buttonContent,
                  {
                    opacity: animatedValues.current[wod.id].interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0, 1],
                    }),
                    transform: [
                      {
                        scale: animatedValues.current[wod.id].interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {wod.completed ? (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.text.inverse}
                  />
                ) : (
                  <Text style={styles.completionButtonText}>
                    Mark as Completed
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Exercise List */}
          <View style={styles.exercisesContainer}>
            {wod.exercises.map((exercise, index) => {
              const isExpanded =
                expandedExercises[`${wod.id}-${index}`] || false;
              const isLastExercise = index === wod.exercises.length - 1;

              return (
                <View key={index}>
                  <Pressable
                    style={styles.exerciseItem}
                    onPress={() => toggleExercise(wod.id, index)}
                  >
                    <Text style={styles.exerciseNumber}>{index + 1}-</Text>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={24}
                      color={Colors.primary[500]}
                    />
                  </Pressable>

                  {/* Exercise Details */}
                  {isExpanded && (
                    <View style={styles.exerciseDetails}>
                      {exercise.details && exercise.details.length > 0 ? (
                        exercise.details.map((detail, detailIndex) => (
                          <Text key={detailIndex} style={styles.detailText}>
                            {detail}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.detailText}>
                          No additional details
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Separator */}
                  {!isLastExercise && !isExpanded && (
                    <View style={styles.separator} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  wodContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  wodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  wodTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
  },
  completionButton: {
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    backgroundColor: "transparent",
    minWidth: 160,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  completionButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  completionButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyXS,
    color: Colors.primary[500],
    lineHeight: 20,
  },
  exercisesContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#3A3A3A",
    marginVertical: 0,
  },
  exerciseNumber: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyLG,
    color: Colors.text.primary,
    marginRight: 8,
  },
  exerciseName: {
    flex: 1,
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyLG,
    color: Colors.text.primary,
  },
  exerciseDetails: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  detailText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 4,
  },
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
});
