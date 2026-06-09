import { personalRecordsService } from "@/api/services";
import { ExerciseSearchInput, Gap, Page } from "@/components";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type {
  CreatePersonalRecordData,
  PRTrackingType,
  StandardExercise,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Lookup tables ─────────────────────────────────────────────────────────────

const TRACKING_ICONS: Record<PRTrackingType, keyof typeof Ionicons.glyphMap> = {
  weight_reps: "barbell-outline",
  reps: "repeat-sharp",
  time: "timer-outline",
  distance: "footsteps-outline",
  pace: "speedometer-outline",
  calories: "flame-outline",
};

const TRACKING_COLORS: Record<PRTrackingType, string> = {
  weight_reps: Colors.primary[500],
  reps: Colors.fitness.strength,
  time: Colors.fitness.flexibility,
  distance: Colors.fitness.rest,
  pace: Colors.fitness.cardio,
  calories: Colors.fitness.cardio,
};

const TRACKING_LABELS: Record<PRTrackingType, string> = {
  weight_reps: "Weight & Reps",
  reps: "Reps",
  time: "Time",
  distance: "Distance",
  pace: "Pace",
  calories: "Calories",
};

// Epley formula for estimated 1-rep max
function epley1RM(weight: number, reps: number): number {
  return reps === 1 ? weight : Math.round(weight * (1 + reps / 30));
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CreatePRScreen() {
  const { showToast } = useToast();

  const [selectedExercise, setSelectedExercise] =
    useState<StandardExercise | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [distance, setDistance] = useState("");
  const [calories, setCalories] = useState("");
  const [achievedAt, setAchievedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: selectedExercise ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [selectedExercise]);

  const handleSelectExercise = (exercise: StandardExercise) => {
    setWeight("");
    setReps("");
    setMinutes("");
    setSeconds("");
    setDistance("");
    setCalories("");
    setSelectedExercise(exercise);
  };

  const trackingType = selectedExercise?.trackingType as
    | PRTrackingType
    | undefined;
  const accentColor = trackingType
    ? TRACKING_COLORS[trackingType]
    : Colors.primary[500];

  // ── Validation ────────────────────────────────────────────────────────────────
  const isValid = (() => {
    if (!selectedExercise || !trackingType) return false;
    switch (trackingType) {
      case "weight_reps":
        return weight.trim() !== "" || reps.trim() !== "";
      case "reps":
        return reps.trim() !== "";
      case "time":
        return minutes.trim() !== "" || seconds.trim() !== "";
      case "distance":
        return distance.trim() !== "";
      case "pace":
        return minutes.trim() !== "" || seconds.trim() !== "";
      case "calories":
        return calories.trim() !== "";
    }
  })();

  // ── Payload builder ───────────────────────────────────────────────────────────
  const buildPayload = (): CreatePersonalRecordData => {
    const type = trackingType!;
    const base: CreatePersonalRecordData = {
      exerciseId: selectedExercise!.id,
      exerciseName: selectedExercise!.name,
      trackingType: type,
    };
    switch (type) {
      case "weight_reps": {
        const w = weight ? parseFloat(weight) : null;
        const r = reps ? parseInt(reps, 10) : null;
        return {
          ...base,
          bestWeight: w,
          bestReps: r,
          bestEstimated1RM: w && r ? epley1RM(w, r) : null,
        };
      }
      case "reps":
        return { ...base, bestReps: reps ? parseInt(reps, 10) : null };
      case "time": {
        const secs =
          (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
        return { ...base, bestTimeInSeconds: secs || null };
      }
      case "distance":
        return {
          ...base,
          bestDistanceMeters: distance ? parseFloat(distance) : null,
        };
      case "pace": {
        // Stored as seconds-per-metre (matching the display formula: value * 1000 = secsPerKm)
        const secsPerKm =
          (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
        return {
          ...base,
          bestDistanceMeters: secsPerKm ? secsPerKm / 1000 : null,
        };
      }
      case "calories":
        return {
          ...base,
          bestCalories: calories ? parseFloat(calories) : null,
        };
      default:
        return base;
    }
  };

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await personalRecordsService.createPersonalRecord(buildPayload());
      showToast({ type: "success", label: "PR saved!" });
      router.dismissAll();
      router.replace("/prs");
    } catch (err: any) {
      showToast({ type: "error", label: err?.message || "Failed to save PR" });
    } finally {
      setSaving(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────────
  const estimated1RM =
    trackingType === "weight_reps" && weight && reps
      ? epley1RM(parseFloat(weight), parseInt(reps, 10))
      : null;

  const formAnimStyle = {
    opacity: formAnim,
    transform: [
      {
        translateY: formAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  // ── Input fields per tracking type ───────────────────────────────────────────
  const renderFields = (type: PRTrackingType) => {
    switch (type) {
      case "weight_reps":
        return (
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.fieldLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.numericInput}
                value={weight}
                onChangeText={setWeight}
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="decimal-pad"
                maxLength={6}
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.fieldLabel}>Reps</Text>
              <TextInput
                style={styles.numericInput}
                value={reps}
                onChangeText={setReps}
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>
        );

      case "reps":
        return (
          <>
            <Text style={styles.fieldLabel}>Total Reps</Text>
            <TextInput
              style={[styles.numericInput, styles.numericInputFull]}
              value={reps}
              onChangeText={setReps}
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
              maxLength={4}
            />
          </>
        );

      case "time":
        return (
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.fieldLabel}>Minutes</Text>
              <TextInput
                style={styles.numericInput}
                value={minutes}
                onChangeText={setMinutes}
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.fieldLabel}>Seconds</Text>
              <TextInput
                style={styles.numericInput}
                value={seconds}
                onChangeText={(t) => {
                  const n = parseInt(t, 10);
                  if (t === "" || (n >= 0 && n <= 59)) setSeconds(t);
                }}
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
        );

      case "pace":
        return (
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.fieldLabel}>Min / km</Text>
              <TextInput
                style={styles.numericInput}
                value={minutes}
                onChangeText={setMinutes}
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.fieldLabel}>Sec / km</Text>
              <TextInput
                style={styles.numericInput}
                value={seconds}
                onChangeText={(t) => {
                  const n = parseInt(t, 10);
                  if (t === "" || (n >= 0 && n <= 59)) setSeconds(t);
                }}
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
        );

      case "distance":
        return (
          <>
            <Text style={styles.fieldLabel}>Distance (m)</Text>
            <TextInput
              style={[styles.numericInput, styles.numericInputFull]}
              value={distance}
              onChangeText={setDistance}
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="decimal-pad"
              maxLength={7}
            />
          </>
        );

      case "calories":
        return (
          <>
            <Text style={styles.fieldLabel}>Calories</Text>
            <TextInput
              style={[styles.numericInput, styles.numericInputFull]}
              value={calories}
              onChangeText={setCalories}
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
              maxLength={4}
            />
          </>
        );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Page
      title="Create Personal Record"
      showBackButton
      footer={
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!isValid || saving) && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={!isValid || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="trophy" size={responsiveSize(20)} color="#fff" />
              <Text style={styles.saveBtnText}>Save PR</Text>
            </>
          )}
        </TouchableOpacity>
      }
    >
      {/* ── Exercise ──────────────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="barbell-outline"
            size={responsiveSize(14)}
            color={Colors.text.secondary}
          />
          <Text style={styles.cardTitle}>Exercise</Text>
        </View>

        <ExerciseSearchInput
          value={selectedExercise?.name ?? ""}
          onSelectExercise={handleSelectExercise}
          placeholder="Search for an exercise..."
        />

        {selectedExercise && trackingType && (
          <View
            style={[styles.exerciseChip, { borderColor: accentColor + "40" }]}
          >
            <View
              style={[
                styles.exerciseChipIcon,
                { backgroundColor: accentColor + "20" },
              ]}
            >
              <Ionicons
                name={TRACKING_ICONS[trackingType]}
                size={responsiveSize(16)}
                color={accentColor}
              />
            </View>
            <View style={styles.exerciseChipBody}>
              <Text style={styles.exerciseChipName} numberOfLines={1}>
                {selectedExercise.name}
              </Text>
              <Text style={styles.exerciseChipMeta}>
                {selectedExercise.category.replace(/_/g, " ")} ·{" "}
                {TRACKING_LABELS[trackingType]}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Performance & Date (animated in after exercise picked) ────────────── */}
      <Animated.View
        pointerEvents={selectedExercise ? "auto" : "none"}
        style={formAnimStyle}
      >
        {selectedExercise && trackingType && (
          <>
            {/* Performance */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name={TRACKING_ICONS[trackingType]}
                  size={responsiveSize(14)}
                  color={accentColor}
                />
                <Text style={styles.cardTitle}>Performance</Text>
                <View
                  style={[
                    styles.typePill,
                    { backgroundColor: accentColor + "20" },
                  ]}
                >
                  <Text style={[styles.typePillText, { color: accentColor }]}>
                    {TRACKING_LABELS[trackingType]}
                  </Text>
                </View>
              </View>

              {renderFields(trackingType)}

              {estimated1RM !== null && (
                <View style={styles.ormRow}>
                  <Ionicons
                    name="flash"
                    size={responsiveSize(14)}
                    color={Colors.primary[500]}
                  />
                  <Text style={styles.ormText}>
                    Estimated 1RM:{" "}
                    <Text style={styles.ormValue}>{estimated1RM} kg</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Date */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={responsiveSize(14)}
                  color={Colors.text.secondary}
                />
                <Text style={styles.cardTitle}>Date Achieved</Text>
              </View>

              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateBtnText}>
                  {achievedAt.toLocaleDateString("en-GB")}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={responsiveSize(16)}
                  color={Colors.text.tertiary}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <>
                  <DateTimePicker
                    value={achievedAt}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    maximumDate={new Date()}
                    onChange={(_, date) => {
                      if (Platform.OS === "android") setShowDatePicker(false);
                      if (date) setAchievedAt(date);
                    }}
                  />
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={styles.doneBtn}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </Animated.View>

      <Gap size={32} />
    </Page>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    flex: 1,
  },
  typePill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typePillText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyXS,
    textTransform: "capitalize",
  },
  exerciseChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  exerciseChipIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseChipBody: {
    flex: 1,
    gap: 2,
  },
  exerciseChipName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  exerciseChipMeta: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    textTransform: "capitalize",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  numericInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.primary,
    textAlign: "center",
  },
  numericInputFull: {
    width: "100%",
  },
  ormRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary[500] + "15",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 6,
  },
  ormText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
  ormValue: {
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.primary[500],
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateBtnText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  doneBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary[500],
    borderRadius: 8,
    marginTop: 8,
  },
  doneBtnText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: "#fff",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary[500],
    borderRadius: 14,
    height: 54,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary[400],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  saveBtnDisabled: {
    backgroundColor: Colors.neutral[700],
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  saveBtnText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: "#fff",
  },
});
