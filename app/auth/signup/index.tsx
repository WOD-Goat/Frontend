import { Button, Input, Page } from "@/components";
import { Typography } from "@/constants";
import { useSignupContext } from "@/hooks";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SignupScreen() {
  const { signupData, updateSignupData } = useSignupContext();
  const [formData, setFormData] = useState({
    fullName: signupData.fullName || "",
    nickname: signupData.nickname || "",
    email: signupData.email || "",
    mobileNumber: signupData.mobileNumber || "",
    password: signupData.password || "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    nickname: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [touchedFields, setTouchedFields] = useState({
    fullName: false,
    nickname: false,
    email: false,
    mobileNumber: false,
    password: false,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Only validate if field has been touched or has content
    if (touchedFields[field as keyof typeof touchedFields] || value.length > 0) {
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
        case "mobileNumber":
          fieldError = validateEgyptianPhone(value);
          break;
        case "password":
          // Only show password errors if user has typed at least 3 characters
          if (value.length >= 3 || touchedFields.password) {
            fieldError = validatePassword(value);
          }
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
      case "mobileNumber":
        fieldError = validateEgyptianPhone(value);
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

  const validateEgyptianPhone = (phone: string): string => {
    if (!phone.trim()) return "Phone number is required";
    
    // Remove any spaces, dashes, or parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    // Check if it starts with +20 followed by 10 digits
    const egyptianPhoneRegex = /^\+20[0-9]{10}$/;
    
    // Also allow format without +20 prefix (must be 11 digits starting with 01)
    const localPhoneRegex = /^01[0-9]{9}$/;
    
    if (!egyptianPhoneRegex.test(cleanPhone) && !localPhoneRegex.test(cleanPhone)) {
      return "Please enter a valid Egyptian phone number (e.g., +201234567890 or 01234567890)";
    }
    return "";
  };

  const validateRequired = (value: string, fieldName: string): string => {
    if (!value.trim()) return `${fieldName} is required`;
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password.trim()) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors = {
      fullName: validateRequired(formData.fullName, "Full Name"),
      nickname: validateRequired(formData.nickname, "Nickname"),
      email: validateEmail(formData.email),
      mobileNumber: validateEgyptianPhone(formData.mobileNumber),
      password: validatePassword(formData.password),
    };

    setErrors(newErrors);

    // Check if there are any errors
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleContinue = () => {
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    // Format phone number to include +20 if not present
    let formattedPhone = formData.mobileNumber.replace(/[\s\-\(\)]/g, "");
    if (formattedPhone.startsWith("01") && formattedPhone.length === 11) {
      formattedPhone = "+20" + formattedPhone.substring(1);
    }

    const formattedData = {
      ...formData,
      mobileNumber: formattedPhone,
    };

    // Update context with current form data
    updateSignupData(formattedData);
    console.log("Updated signup data:", formattedData);
    // Navigate to gender selection
    router.push("./gender");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const renderFooter = () => {
    const hasErrors = Object.values(errors).some(error => error !== "");
    const hasEmptyFields = Object.values(formData).some(value => !value.trim());
    const isDisabled = hasErrors || hasEmptyFields;

    return (
      <Button
        title="Continue →"
        onPress={handleContinue}
        variant="secondary"
        size="large"
        fullWidth
        disabled={isDisabled}
      />
    );
  };

  return (
    <Page title="Sign Up" footer={renderFooter()}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, Typography.displaySmall]}>
          Join 90 Box Family 💛
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
            placeholder="Your full name"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange("fullName", value)}
            onBlur={() => handleFieldBlur("fullName")}
            autoCapitalize="words"
            autoComplete="name"
          />
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}
        </View>

        {/* Nickname Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>Nickname</Text>
          <Input
            placeholder="Your nickname"
            value={formData.nickname}
            onChangeText={(value) => handleInputChange("nickname", value)}
            onBlur={() => handleFieldBlur("nickname")}
            autoCapitalize="none"
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
            placeholder="Your email address"
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

        {/* Mobile Number Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>
            Mobile Number
          </Text>
          <Input
            placeholder="+201234567890 or 01234567890"
            value={formData.mobileNumber}
            onChangeText={(value) => handleInputChange("mobileNumber", value)}
            onBlur={() => handleFieldBlur("mobileNumber")}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          {errors.mobileNumber ? (
            <Text style={styles.errorText}>{errors.mobileNumber}</Text>
          ) : null}
        </View>

        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>Password</Text>
          <Input
            placeholder="Min 8 chars, uppercase, lowercase, number, special char"
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
    color: "#000000",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: "#666666",
  },

  // Form Section
  formSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    color: "#000000",
    marginBottom: 8,
  },
  errorText: {
    color: "#FF6B6B",
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
    color: "#666666",
  },
  loginLink: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
