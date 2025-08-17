import { Button, Input, Page } from "@/components";
import { Typography } from "@/constants";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    fullName: "",
    nickname: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    // Validate form data here
    console.log("Form data:", formData);
    // Navigate to gender selection
    router.push("./signup/gender");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const renderFooter = () => (
    <Button
      title="Continue →"
      onPress={handleContinue}
      variant="secondary"
      size="large"
      fullWidth
    />
  );

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
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>

        {/* Nickname Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>Nickname</Text>
          <Input
            placeholder="Your nickname"
            value={formData.nickname}
            onChangeText={(value) => handleInputChange("nickname", value)}
            autoCapitalize="none"
          />
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
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Mobile Number Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>
            Mobile Number
          </Text>
          <Input
            placeholder="Your mobile number"
            value={formData.mobileNumber}
            onChangeText={(value) => handleInputChange("mobileNumber", value)}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>

        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, Typography.labelMedium]}>Password</Text>
          <Input
            placeholder="Your password"
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
            secureTextEntry
            autoComplete="password-new"
          />
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
