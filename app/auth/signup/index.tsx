import { Button, Input, Page } from "@/components";
import { Colors, FontFamilies, Typography } from "@/constants";
import { useAuth } from "@/hooks";
import { RegisterUserData } from "@/types";
import { router } from "expo-router";
import {
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Purchases from "react-native-purchases";
import { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
  });
  const { register } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
  });

  const [touchedFields, setTouchedFields] = useState({
    name: false,
    nickname: false,
    email: false,
    password: false,
  });

  // Coach application state
  const [isCoachApplication, setIsCoachApplication] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avgAthletesCount, setAvgAthletesCount] = useState("");
  const [currentGym, setCurrentGym] = useState("");
  const [coachErrors, setCoachErrors] = useState({ phone: "", athletes: "", gym: "" });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Only validate if field has been touched or has content
    if (
      touchedFields[field as keyof typeof touchedFields] ||
      value.length > 0
    ) {
      let fieldError = "";
      switch (field) {
        case "name":
          fieldError = validateRequired(value, "Full Name");
          break;
        case "nickname":
          fieldError = validateRequired(value, "Nickname");
          break;
        case "email":
          fieldError = validateEmail(value);
          break;
        case "password":
          fieldError = validatePassword(value);

          break;
      }

      // Update the specific field's error
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    // Validate on blur
    const value = formData[field as keyof typeof formData];
    let fieldError = "";
    switch (field) {
      case "fullName":
        fieldError = validateRequired(value, "Full Name");
        break;
      case "nickname":
        fieldError = validateRequired(value, "Nickname");
        break;
      case "email":
        fieldError = validateEmail(value);
        break;
      case "password":
        fieldError = validatePassword(value);
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validateRequired = (value: string, fieldName: string): string => {
    if (!value.trim()) return `${fieldName} is required`;
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password.trim()) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    return "";
  };

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

  const handleCoachToggle = (value: boolean) => {
    setIsCoachApplication(value);
    if (!value) {
      setPhoneNumber("");
      setAvgAthletesCount("");
      setCurrentGym("");
      setCoachErrors({ phone: "", athletes: "", gym: "" });
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setCoachErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
  };

  const handleAthletesChange = (value: string) => {
    setAvgAthletesCount(value);
    setCoachErrors((prev) => ({ ...prev, athletes: validateAthletes(value) }));
  };

  const handleGymChange = (value: string) => {
    setCurrentGym(value);
    setCoachErrors((prev) => ({ ...prev, gym: validateGym(value) }));
  };

  const handleRegister = async () => {
    // Validate coach fields before submitting
    if (isCoachApplication) {
      const phoneErr = validatePhone(phoneNumber);
      const athletesErr = validateAthletes(avgAthletesCount);
      const gymErr = validateGym(currentGym);
      setCoachErrors({ phone: phoneErr, athletes: athletesErr, gym: gymErr });
      if (phoneErr || athletesErr || gymErr) return;
    }

    try {
      setIsLoading(true);

      const userData: RegisterUserData = {
        email: formData.email!,
        password: formData.password!,
        name: formData.name!,
        nickname: formData.nickname!,
        profilePictureUrl: "",
        ...(isCoachApplication && {
          phoneNumber: phoneNumber.trim(),
          avgAthletesCount: parseInt(avgAthletesCount, 10),
          currentGym: currentGym.trim(),
        }),
      };

      // Call register function
      const success = await register(userData);

      if (success) {
        console.log("Registration completed successfully!");
        const firebaseAuth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          userData.email,
          userData.password,
        );
        await sendEmailVerification(userCredential.user);
        console.log("Verification email sent to:", userData.email);
        try {
          await Purchases.logIn(userCredential.user.uid);
        } catch (e) {
          console.warn("RevenueCat logIn failed:", e);
        }
        router.replace({
          pathname: "/auth/signup/verify",
          params: { isCoach: isCoachApplication ? "1" : "0" },
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const renderFooter = () => {
    const hasErrors = Object.values(errors).some((error) => error !== "");
    const hasEmptyFields = Object.values(formData).some(
      (value) => !value.trim(),
    );
    const coachFieldsInvalid =
      isCoachApplication &&
      (validatePhone(phoneNumber) !== "" ||
        validateAthletes(avgAthletesCount) !== "" ||
        validateGym(currentGym) !== "" ||
        !currentGym.trim());
    const isDisabled = hasErrors || hasEmptyFields || coachFieldsInvalid;

    return (
      <View style={{gap: 16}}>
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, Typography.bodyMedium]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={[styles.loginLink, Typography.bodyMedium]}>Login</Text>
          </TouchableOpacity>
        </View>
        <Button
          title="Register →"
          onPress={handleRegister}
          variant="primary"
          size="large"
          fullWidth
          disabled={isDisabled}
          loading={isLoading}
        />
      </View>
    );
  };

  return (
    <Page footer={renderFooter()}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, Typography.displaySmall]}>
          Join WODGoat Family 🐐
        </Text>
        <Text style={[styles.welcomeSubtitle, Typography.bodyMedium]}>
          Enter your account details to continue
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {/* Full Name Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>Full Name</Text>
          <Input
            placeholder="Your Fullname"
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            onBlur={() => handleFieldBlur("name")}
            autoCapitalize="words"
            autoComplete="name"
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}
        </View>

        {/* Nickname Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>Nickname</Text>
          <Input
            placeholder="Your Nickname"
            value={formData.nickname}
            onChangeText={(value) => handleInputChange("nickname", value)}
            onBlur={() => handleFieldBlur("nickname")}
            autoCapitalize="words"
          />
          {errors.nickname ? (
            <Text style={styles.errorText}>{errors.nickname}</Text>
          ) : null}
        </View>

        {/* Email Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>
            Email Address
          </Text>
          <Input
            placeholder="Your Email Address"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            onBlur={() => handleFieldBlur("email")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>Password</Text>
          <Input
            placeholder="Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
            onBlur={() => handleFieldBlur("password")}
            secureTextEntry
            autoComplete="password-new"
          />
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Coach Application Section */}
        <View style={styles.coachSection}>
          <View style={styles.coachDivider} />
          <View style={styles.coachToggleRow}>
            <View style={styles.coachToggleLeft}>
              <Text style={[styles.label, Typography.labelMedium]}>
                Register as a Coach
              </Text>
              <Text style={styles.coachToggleSubtext}>
                Apply to access coach features
              </Text>
            </View>
            <Switch
              value={isCoachApplication}
              onValueChange={handleCoachToggle}
              trackColor={{
                false: Colors.neutral[700],
                true: Colors.primary[500],
              }}
              thumbColor={Colors.text.inverse}
            />
          </View>

          {isCoachApplication && (
            <View style={styles.coachFields}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, Typography.labelMedium]}>
                  Phone Number
                </Text>
                <Input
                  placeholder="e.g. +1 234 567 8900"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
                {coachErrors.phone ? (
                  <Text style={styles.errorText}>{coachErrors.phone}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, Typography.labelMedium]}>
                  Avg. Athletes You Coach
                </Text>
                <Input
                  placeholder="e.g. 10"
                  value={avgAthletesCount}
                  onChangeText={handleAthletesChange}
                  keyboardType="number-pad"
                />
                {coachErrors.athletes ? (
                  <Text style={styles.errorText}>{coachErrors.athletes}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, Typography.labelMedium]}>
                  Current Gym / Box
                </Text>
                <Input
                  placeholder="e.g. CrossFit Downtown"
                  value={currentGym}
                  onChangeText={handleGymChange}
                  autoCapitalize="words"
                />
                {coachErrors.gym ? (
                  <Text style={styles.errorText}>{coachErrors.gym}</Text>
                ) : null}
              </View>

              <View style={styles.coachInfoNote}>
                <Text style={styles.coachInfoText}>
                  Our team will contact you at this number to review your
                  application and finalize the coach agreement. Make sure it's
                  available.
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  // Welcome Section
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    color: Colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: Colors.text.primary,
  },

  // Form Section
  formSection: {
    flex: 1,
    justifyContent: "flex-start",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    color: Colors.text.primary,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.error[500],
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Button Section
  buttonSection: {
    marginTop: 16,
    marginBottom: 32,
  },

  // Login Section
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: Colors.text.primary,
  },
  loginLink: {
    color: Colors.primary[500],
    fontWeight: "bold",
  },

  // Coach Application Section
  coachSection: {
    marginBottom: 10,
  },
  coachDivider: {
    height: 1,
    backgroundColor: Colors.neutral[700],
    marginBottom: 16,
  },
  coachToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  coachToggleLeft: {
    flex: 1,
    marginRight: 12,
  },
  coachToggleSubtext: {
    fontSize: 13,
    fontFamily: FontFamilies.spartanMedium,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  coachFields: {
    marginTop: 12,
  },
  coachInfoNote: {
    backgroundColor: Colors.primary[500] + "15",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
    marginTop: 4,
    marginBottom: 8,
  },
  coachInfoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
    fontFamily: FontFamilies.poppinsRegular,
  },
});
