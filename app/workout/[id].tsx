import { Button, Page } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
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
  const { date, workoutType } = params;

  // Sample data - in a real app, this would come from an API or global state
  const [wods, setWods] = useState<WOD[]>([
    {
      id: "wod1",
      title: "WOD1",
      exercises: [
        { name: "Chest Press" },
        { name: "Strict Press" },
        { name: "Lateral Raises" },
        { name: "Triceps Pushdowns" },
      ],
      completed: true,
    },
    {
      id: "wod2",
      title: "WOD2",
      exercises: [
        { name: "Squat Cleans" },
        {
          name: "Cleans Complex",
          details: [
            "4 Rounds:",
            "3 Deadlifts",
            "1 Squat Cleans",
            "2 Hang Cleans",
            "1 Jerk",
            "Weight: Up to 85%",
          ],
        },
      ],
      completed: false,
    },
  ]);

  const [expandedExercises, setExpandedExercises] = useState<{
    [key: string]: boolean;
  }>({});

  // Animated values for completion button transitions
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

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

  return (
    <Page
      title="Workout Details"
      footer={
        <Button
          title="Complete Workout"
          size="large"
          disabled={wods.some((wod) => !wod.completed)}
          onPress={() => {
            //Mark workout as completed - this would involve updating state and possibly making an API call in a real app
            router.back();
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
});
