import { Button, Input, Page } from "@/components";
import { Colors, Typography } from "@/constants";
import { useAuth } from "@/hooks";
import { RegisterUserData } from "@/types";
import { router } from "expo-router";
import {
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  const handleRegister = async () => {
    try {
      setIsLoading(true);

      const userData: RegisterUserData = {
        email: formData.email!,
        password: formData.password!,
        name: formData.name!,
        nickname: formData.nickname!,
        profilePictureUrl: "",
      };

      // Call register function
      const success = await register(userData);

      if (success) {
        console.log("Registration completed successfully!");
        const auth = getAuth();
        signInWithEmailAndPassword(auth, userData.email, userData.password);
        sendEmailVerification(auth.currentUser!);

        router.replace("/(tabs)");
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
    const isDisabled = hasErrors || hasEmptyFields;

    return (
      <Button
        title="Register →"
        onPress={handleRegister}
        variant="primary"
        size="large"
        fullWidth
        disabled={isDisabled}
        loading={isLoading}
      />
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

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, Typography.bodyMedium]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={[styles.loginLink, Typography.bodyMedium]}>Login</Text>
          </TouchableOpacity>
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
});
