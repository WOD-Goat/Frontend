import { Colors, FontSizes } from "@/constants";
import standardExercises from "@/constants/standardExercises.json";
import type { StandardExercise } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";
import { BottomSheet } from "./BottomSheet";

interface ExerciseSearchInputProps {
  value: string;
  onSelectExercise: (exercise: StandardExercise) => void;
  placeholder?: string;
}

export default function ExerciseSearchInput({
  value,
  onSelectExercise,
  placeholder = "Search for an exercise",
}: ExerciseSearchInputProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<
    StandardExercise[]
  >([]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      const filtered = (standardExercises as StandardExercise[]).filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query) ||
          exercise.category.toLowerCase().includes(query) ||
          exercise.muscleGroups.some((group) =>
            group.toLowerCase().includes(query),
          ),
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises([]);
    }
  }, [searchQuery]);

  const handleOpenModal = () => {
    setSearchQuery("");
    setFilteredExercises([]);
    setShowModal(true);
  };

  const handleSelectExercise = (exercise: StandardExercise) => {
    onSelectExercise(exercise);
    setShowModal(false);
    setSearchQuery("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.input} onPress={handleOpenModal}>
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="search" size={20} color={Colors.text.tertiary} />
      </TouchableOpacity>

      <BottomSheet
        visible={showModal}
        onClose={handleCloseModal}
        title="Search Exercises"
        maxHeight="85%"
        height="85%"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidView}
        >
          <View style={styles.bottomSheetContent}>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <Ionicons
                name="search"
                size={20}
                color={Colors.text.tertiary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exercises..."
                placeholderTextColor={Colors.text.tertiary}
                autoCapitalize="words"
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.text.tertiary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Results */}
            {searchQuery.length < 2 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search"
                  size={48}
                  color={Colors.text.tertiary}
                />
                <Text style={styles.emptyStateText}>
                  Type at least 2 characters to search
                </Text>
              </View>
            ) : filteredExercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="sad-outline"
                  size={48}
                  color={Colors.text.tertiary}
                />
                <Text style={styles.emptyStateText}>No exercises found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try different keywords
                </Text>
              </View>
            ) : (
              <View style={styles.resultsWrapper}>
                {filteredExercises.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.exerciseItem}
                    onPress={() => handleSelectExercise(item)}
                  >
                    <View style={styles.exerciseContent}>
                      <Text style={styles.exerciseName}>{item.name}</Text>
                      <Text style={styles.exerciseDetails}>
                        {item.category.replace("_", " ")} •{" "}
                        {item.trackingType.replace("_", " ")}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.text.tertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  } as ViewStyle,
  input: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.text.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  } as ViewStyle,
  inputText: {
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    flex: 1,
  } as TextStyle,
  placeholderText: {
    color: Colors.text.tertiary,
  } as TextStyle,
  keyboardAvoidView: {
    flex: 1,
  } as ViewStyle,
  bottomSheetContent: {
    paddingBottom: 20,
  } as ViewStyle,
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.text.tertiary,
  } as ViewStyle,
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    padding: 0,
  } as TextStyle,
  resultsWrapper: {
    paddingHorizontal: 16,
  } as ViewStyle,
  emptyState: {
    paddingVertical: 60,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  } as ViewStyle,
  emptyStateText: {
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    marginTop: 16,
    textAlign: "center",
  } as TextStyle,
  emptyStateSubtext: {
    fontSize: FontSizes.bodySM,
    color: Colors.text.tertiary,
    marginTop: 8,
    textAlign: "center",
  } as TextStyle,
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.tertiary,
    borderBottomStyle: "solid",
  } as ViewStyle,
  exerciseContent: {
    flex: 1,
    gap: 4,
  } as ViewStyle,
  exerciseName: {
    fontSize: FontSizes.bodyMD,
    fontWeight: "600",
    color: Colors.text.primary,
  } as TextStyle,
  exerciseDetails: {
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textTransform: "capitalize",
  } as TextStyle,
});
