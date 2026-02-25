import { ExerciseSearchInput, Input } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { StandardExercise } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Exercise {
  name: string;
  instructions?: string[];
}

interface WOD {
  id: string;
  title: string;
  exercises: Exercise[];
  completed: boolean;
}

interface WorkoutViewProps {
  wods: WOD[];
  isEditingWorkout: boolean;
  expandedExercises: { [key: string]: boolean };
  animatedValues: { [key: string]: Animated.Value };
  onToggleExercise: (wodId: string, exerciseIndex: number) => void;
  onToggleWODCompletion: (wodId: string) => void;
  onUpdateWodTitle: (wodId: string, title: string) => void;
  onUpdateExercise: (
    wodId: string,
    exerciseIndex: number,
    field: "name" | "instructions",
    value: string,
  ) => void;
  onAddWod: () => void;
  onRemoveWod: (wodId: string) => void;
  onAddExercise: (wodId: string) => void;
  onRemoveExercise: (wodId: string, exerciseIndex: number) => void;
}

export default function WorkoutView({
  wods,
  isEditingWorkout,
  expandedExercises,
  animatedValues,
  onToggleExercise,
  onToggleWODCompletion,
  onUpdateWodTitle,
  onUpdateExercise,
  onAddWod,
  onRemoveWod,
  onAddExercise,
  onRemoveExercise,
}: WorkoutViewProps) {
  // Render editing mode
  if (isEditingWorkout) {
    return (
      <>
        {wods.map((wod, wodIndex) => (
          <View key={wod.id} style={styles.wodContainer}>
            {/* WOD Header - Inside card in edit mode */}
            <View style={styles.wodHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.editLabel}>WOD {wodIndex + 1}</Text>
                <Input
                  value={wod.title}
                  onChangeText={(text) => onUpdateWodTitle(wod.id, text)}
                  placeholder="WOD name"
                />
              </View>
              {wods.length > 1 && (
                <TouchableOpacity
                  onPress={() => onRemoveWod(wod.id)}
                  style={styles.removeWodButton}
                >
                  <Text style={styles.removeWodButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Exercise List */}
            <View style={styles.exercisesContainer}>
              {wod.exercises.map((exercise, index) => (
                <View key={index} style={styles.editExerciseContainer}>
                  <View style={styles.editExerciseHeader}>
                    <Text style={styles.editExerciseLabel}>
                      Exercise {index + 1}
                    </Text>
                    {wod.exercises.length > 1 && (
                      <TouchableOpacity
                        onPress={() => onRemoveExercise(wod.id, index)}
                        style={styles.removeExerciseButton}
                      >
                        <Text style={styles.removeExerciseText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <ExerciseSearchInput
                      value={exercise.name}
                      onSelectExercise={(selectedExercise: StandardExercise) =>
                        onUpdateExercise(wod.id, index, "name", selectedExercise.name)
                      }
                      placeholder="Search for an exercise"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Instructions</Text>
                    <Input
                      value={exercise.instructions?.[0] || ""}
                      onChangeText={(text) =>
                        onUpdateExercise(wod.id, index, "instructions", text)
                      }
                      placeholder="Exercise instructions (e.g., 21-15-9 reps)"
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                </View>
              ))}

              {/* Add Exercise Button */}
              <TouchableOpacity
                style={styles.addExerciseButton}
                onPress={() => onAddExercise(wod.id)}
              >
                <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add WOD Button */}
        <TouchableOpacity style={styles.addWodButton} onPress={onAddWod}>
          <Text style={styles.addWodButtonText}>+ Add WOD</Text>
        </TouchableOpacity>
      </>
    );
  }

  // Render viewing mode
  return (
    <>
      {wods.map((wod, wodIndex) => (
        <View key={wod.id} style={styles.wodWrapper}>
          {/* WOD Header - Outside card in view mode */}
          <View style={styles.wodHeaderView}>
            <Text style={styles.wodTitle}>{wod.title}</Text>
            <TouchableOpacity
              style={[
                styles.completionButton,
                wod.completed && styles.completionButtonActive,
              ]}
              onPress={() => onToggleWODCompletion(wod.id)}
            >
              <Animated.View
                style={[
                  styles.buttonContent,
                  {
                    opacity: animatedValues[wod.id].interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0, 1],
                    }),
                    transform: [
                      {
                        scale: animatedValues[wod.id].interpolate({
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

          {/* Exercise List Card */}
          <View style={styles.exercisesCard}>
            {wod.exercises.map((exercise, index) => {
              const isExpanded =
                expandedExercises[`${wod.id}-${index}`] || false;
              const isLastExercise = index === wod.exercises.length - 1;

              return (
                <View key={index}>
                  <Pressable
                    style={styles.exerciseItem}
                    onPress={() => onToggleExercise(wod.id, index)}
                  >
                    <Text style={styles.exerciseNumber}>{index + 1}-</Text>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={24}
                      color={Colors.primary[500]}
                    />
                  </Pressable>

                  {/* Exercise Instructions */}
                  {isExpanded && (
                    <View style={styles.exerciseDetails}>
                      {exercise.instructions &&
                      exercise.instructions.length > 0 ? (
                        exercise.instructions.map(
                          (instruction, instructionIndex) => (
                            <Text
                              key={instructionIndex}
                              style={styles.detailText}
                            >
                              {instruction}
                            </Text>
                          ),
                        )
                      ) : (
                        <Text style={styles.detailText}>
                          No additional instructions
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
    </>
  );
}

const styles = StyleSheet.create({
  // Edit mode styles
  wodContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  wodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  // View mode styles
  wodWrapper: {
    paddingTop: 24,
    marginBottom: 24,
  },
  wodHeaderView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,

  },
  exercisesCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
  },
  // Shared styles
  wodTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    flex: 1,
  },
  completionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    maxHeight: 36,
    justifyContent: "center",
  },
  completionButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  completionButtonText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
  exercisesContainer: {
    gap: 0,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  exerciseNumber: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    width: 24,
  },
  exerciseName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    flex: 1,
  },
  exerciseDetails: {
    paddingLeft: 24,
    paddingRight: 16,
  },
  detailText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.tertiary,
    marginBottom: 4,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.text.secondary,
    marginLeft: 24,
  },
  // Edit mode styles
  editLabel: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  removeWodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.error[500],
    borderRadius: 6,
  },
  removeWodButtonText: {
    color: "#FFFFFF",
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
  },
  editExerciseContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  editExerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editExerciseLabel: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  removeExerciseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error[500],
    justifyContent: "center",
    alignItems: "center",
  },
  removeExerciseText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  addExerciseButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderStyle: "dashed",
    marginTop: 8,
  },
  addExerciseButtonText: {
    color: Colors.primary[500],
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
  },
  addWodButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  addWodButtonText: {
    color: Colors.text.primary,
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
  },
});
