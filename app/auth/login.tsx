import { Button, Input, Page } from "@/components";
import { Typography } from "@/constants";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Handle login logic here
    console.log("Login pressed", { email, password });
    router.replace("/(tabs)");
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
    console.log("Forgot password pressed");
  };

  const handleRegister = () => {
    // Navigate to register screen
    router.push("/auth/signup");
  };

  return (
    <Page>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, Typography.displaySmall]}>
          Welcome to 90 Box 💛
        </Text>
        <Text style={[styles.welcomeSubtitle, Typography.bodyMedium]}>
          Enter your account details to continue
        </Text>
      </View>

      {/* Input Fields Section */}
      <View style={styles.formSection}>
        {/* Email Field */}
        <View style={styles.inputGroup}>
          <Input
            label="Email Address"
            placeholder="Your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        {/* Login Button */}
        <View style={styles.buttonSection}>
          <Button
            title="Login"
            onPress={handleLogin}
            variant="secondary"
            size="large"
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={[styles.forgotPasswordText, Typography.bodySmall]}>
              Forget Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.registerTextContainer}>
        <Text style={[styles.registerText, Typography.bodyMedium]}>
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={[styles.registerLink, Typography.bodyMedium]}>
            Register
          </Text>
        </TouchableOpacity>
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
    marginBottom: 4,
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
    marginBottom: 24,
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 16,
  },
  forgotPasswordText: {
    color: "#666666",
  },

  // Register Section
  registerTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#666666",
  },
  registerLink: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
