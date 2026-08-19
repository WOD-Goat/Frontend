import { joinService, programsService } from "@/api/services";
import { Button, Input, Page } from "@/components";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import type { ProgramLookup } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Step = "code" | "start-date";

export default function JoinScreen() {
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<ProgramLookup | null>(null);
  const [startsToday, setStartsToday] = useState(true);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { showToast } = useToast();

  // Step 1: resolve the code server-side — the backend tries Group codes
  // first (joining immediately on match), then falls back to Program codes
  // (preview only). The athlete doesn't need to know ahead of time whether
  // a code belongs to a Group or a Program.
  const handleResolveCode = async () => {
    Keyboard.dismiss();
    if (code.trim().length !== 6) {
      showToast({ type: "error", label: "Please enter a valid 6-character code" });
      return;
    }
    try {
      setLoading(true);
      const trimmed = code.trim().toUpperCase();

      const response = await joinService.resolveCode(trimmed);
      if (response.success && response.data) {
        if (response.data.type === "group") {
          showToast({ type: "success", label: `Joined Group Successfully!` });
          router.dismissAll();
          router.replace("/(tabs)/groups");
        } else {
          setProgram(response.data);
          setStep("start-date");
        }
      } else {
        showToast({ type: "error", label: response.message || "Invalid or expired code" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Invalid or expired code" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2 (program only): confirm the start date and actually join
  const handleJoinProgram = async () => {
    if (!program) return;
    try {
      setLoading(true);
      const startDate = startsToday ? new Date() : customStartDate;
      const response = await programsService.joinProgram(code.trim().toUpperCase(), startDate);
      if (response.success) {
        showToast({ type: "success", label: `Joined "${program.name}"!` });
        router.dismissAll();
        router.replace("/(tabs)/groups");
      } else {
        showToast({ type: "error", label: response.message || "Failed to join program" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to join program" });
    } finally {
      setLoading(false);
    }
  };

  if (step === "start-date" && program) {
    return (
      <Page
        title={program.name}
        showBackButton={true}
        footer={
          <Button
            title={loading ? "Joining..." : "Join Program"}
            variant="primary"
            size="large"
            fullWidth
            disabled={loading}
            onPress={handleJoinProgram}
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.iconSection}>
            <View style={styles.iconRing}>
              <Ionicons name="calendar-outline" size={36} color={Colors.primary[500]} />
            </View>
            <Text style={styles.programName}>{program.name}</Text>
            {program.description ? <Text style={styles.description}>{program.description}</Text> : null}
            <Text style={styles.description}>
              {Math.ceil(program.durationDays / 7)} weeks · {program.durationDays} days
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>When do you want to start?</Text>
            <Text style={styles.hint}>Day 1 begins on whichever date you pick.</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.optionCard, startsToday && styles.optionCardActive]}
                onPress={() => setStartsToday(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="today-outline" size={20} color={startsToday ? Colors.primary[500] : Colors.text.secondary} />
                <Text style={[styles.optionText, startsToday && styles.optionTextActive]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionCard, !startsToday && styles.optionCardActive]}
                onPress={() => { setStartsToday(false); setShowDatePicker(true); }}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={20} color={!startsToday ? Colors.primary[500] : Colors.text.secondary} />
                <Text style={[styles.optionText, !startsToday && styles.optionTextActive]}>
                  {!startsToday ? customStartDate.toLocaleDateString("en-GB") : "Pick a date"}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && !startsToday && (
              <>
                <DateTimePicker
                  value={customStartDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === "android") setShowDatePicker(false);
                    if (selectedDate) setCustomStartDate(selectedDate);
                  }}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Page>
    );
  }

  return (
    <Page
      title="Join"
      showBackButton={true}
      footer={
        <Button
          title={loading ? "Checking..." : "Continue"}
          variant="primary"
          size="large"
          fullWidth
          disabled={code.trim().length !== 6 || loading}
          onPress={handleResolveCode}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.iconSection}>
          <View style={styles.iconRing}>
            <Ionicons name="enter-outline" size={36} color={Colors.primary[500]} />
          </View>
          <Text style={styles.description}>
            Enter the 6-character code shared by your coach to join their group or program.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Code</Text>
          <Input
            placeholder="XXXXXX"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            autoFocus
          />
          <Text style={styles.hint}>Codes are case-insensitive</Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 28 },
  iconSection: { alignItems: "center", paddingTop: 16, gap: 16 },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[500] + "15",
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  programName: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    textAlign: "center",
  },
  formSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  label: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  hint: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  optionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  optionCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: Colors.background.primary,
  },
  optionCardActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[500] + "12",
  },
  optionText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: responsiveSize(12),
    color: Colors.text.secondary,
  },
  optionTextActive: { color: Colors.primary[500] },
  doneButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 6,
  },
  doneButtonText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: responsiveSize(14),
    color: "#fff",
  },
});
