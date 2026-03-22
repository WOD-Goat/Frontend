import { Button, Input, Page } from "@/components";
import { auth } from "@/config/firebase";
import { Colors, FontFamilies, FontSizes, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("Email is required");
      setIsEmailValid(false);
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      setIsEmailValid(false);
      return false;
    }
    setEmailError("");
    setIsEmailValid(true);
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const handleSendReset = async () => {
    if (!isEmailValid) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      router.push({
        pathname: "/auth/forgot-password/sent",
        params: { email },
      });
    } catch (e: any) {
      const message =
        e.code === "auth/user-not-found"
          ? "No account found with this email address."
          : e.code === "auth/too-many-requests"
            ? "Too many attempts. Please try again later."
            : "Failed to send reset email. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      footer={
        <View style={styles.buttonRow}>
          <View style={styles.sendButton}>
            <Button
              title={loading ? "Sending..." : "Send Reset Link"}
              onPress={handleSendReset}
              variant="primary"
              size="large"
              disabled={loading || !isEmailValid}
              loading={loading}
            />
          </View>
        </View>
      }
    >
      <View style={styles.welcomeSection}>
        <Text style={[styles.title, Typography.displaySmall]}>
          Forgot Password?
        </Text>
        <Text style={[styles.subtitle, Typography.bodyMedium]}>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Input
            label="Email Address"
            placeholder="Your email address"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    marginBottom: 32,
  },
  title: {
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.secondary,
  },
  formSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  inputGroup: {
    marginBottom: 24,
  },
  buttonSection: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  backButton: {
    width: "10%",
    alignItems:'center',
    justifyContent:'center',
  },

  sendButton: {
    flex: 1,
  },
  errorText: {
    color: Colors.error[500],
    fontSize: 12,
    marginTop: 4,
  },
  backContainer: {
    alignItems: "center",
  },
  backText: {
    color: Colors.text.primary,
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanMedium,
  },
});
