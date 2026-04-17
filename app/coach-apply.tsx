import { Button, Input } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { authService } from "@/api/services/auth";
import { useGlobalState } from "@/components/lib";
import { storage } from "@/components/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CoachApplyScreen() {
  const globalState = useGlobalState();
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [avgAthletesCount, setAvgAthletesCount] = useState("");
  const [currentGym, setCurrentGym] = useState("");
  const [errors, setErrors] = useState({ phone: "", athletes: "", gym: "" });
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "Phone number is required";
    if (digits.length < 7) return "Enter a valid phone number";
    return "";
  };

  const validateAthletes = (value: string): string => {
    const num = parseInt(value, 10);
    if (!value.trim()) return "This field is required";
    if (isNaN(num) || num < 1) return "Enter a number greater than 0";
    return "";
  };

  const validateGym = (value: string): string => {
    if (!value.trim()) return "Gym or box name is required";
    return "";
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
  };

  const handleAthletesChange = (value: string) => {
    setAvgAthletesCount(value);
    setErrors((prev) => ({ ...prev, athletes: validateAthletes(value) }));
  };

  const handleGymChange = (value: string) => {
    setCurrentGym(value);
    setErrors((prev) => ({ ...prev, gym: validateGym(value) }));
  };

  const isSubmitDisabled =
    !phoneNumber.trim() ||
    !avgAthletesCount.trim() ||
    !currentGym.trim() ||
    validatePhone(phoneNumber) !== "" ||
    validateAthletes(avgAthletesCount) !== "" ||
    validateGym(currentGym) !== "";

  const handleSubmit = async () => {
    const phoneErr = validatePhone(phoneNumber);
    const athletesErr = validateAthletes(avgAthletesCount);
    const gymErr = validateGym(currentGym);
    setErrors({ phone: phoneErr, athletes: athletesErr, gym: gymErr });
    if (phoneErr || athletesErr || gymErr) return;

    try {
      setIsLoading(true);
      const response = await authService.applyAsCoach({
        phoneNumber: phoneNumber.trim(),
        avgAthletesCount: parseInt(avgAthletesCount, 10),
        currentGym: currentGym.trim(),
      });

      if (response.success) {
        try {
          const profileRes = await authService.getProfile();
          await storage.set("user", profileRes.user);
          globalState.set("user", profileRes.user);
        } catch {
          // Non-critical — profile will refresh on next app open
        }

        Alert.alert(
          "Application Submitted",
          "Our team will contact you to review your application and finalize the coach agreement. Keep your phone available.",
          [{ text: "Got it", onPress: () => router.back() }],
        );
      }
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.dragHandle} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBg}>
              <Ionicons name="trophy-outline" size={28} color={Colors.primary[500]} />
            </View>
            <Text style={styles.title}>Apply as a Coach</Text>
            <Text style={styles.subtitle}>
              Fill in the details below. Our team will contact you to review your application and finalize the coach agreement.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <Input
                placeholder="e.g. +1 234 567 8900"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Avg. Athletes You Coach</Text>
              <Input
                placeholder="e.g. 10"
                value={avgAthletesCount}
                onChangeText={handleAthletesChange}
                keyboardType="number-pad"
              />
              {errors.athletes ? (
                <Text style={styles.errorText}>{errors.athletes}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Gym / Box</Text>
              <Input
                placeholder="e.g. CrossFit Downtown"
                value={currentGym}
                onChangeText={handleGymChange}
                autoCapitalize="words"
              />
              {errors.gym ? (
                <Text style={styles.errorText}>{errors.gym}</Text>
              ) : null}
            </View>

            <View style={styles.infoNote}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={Colors.primary[500]}
                style={{ marginTop: 1 }}
              />
              <Text style={styles.infoText}>
                Our team will contact you at this number to verify your coach status. Make sure it's reachable.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky footer */}
        <View style={[styles.footer, { paddingBottom: (insets.bottom || 16) + 16 }]}>
          <Button
            title="Submit Application"
            onPress={handleSubmit}
            variant="primary"
            size="large"
            fullWidth
            disabled={isSubmitDisabled}
            loading={isLoading}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[600],
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  // Header
  header: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 28,
    gap: 10,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary[500] + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: FontSizes.heading2XL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Form
  form: {
    gap: 4,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.error[500],
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  infoNote: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.primary[500] + "15",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
    marginTop: 4,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  footer: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
    backgroundColor: Colors.background.primary,
  },
});
