import { Button, Input, Page } from "@/components";
import { auth } from "@/config/firebase";
import Purchases from "react-native-purchases";
import { Colors, FontFamilies, FontSizes, Typography, responsiveSize } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  const { login, loading, error } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      setIsEmailValid(false);
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      setIsEmailValid(false);
      return false;
    }
    setEmailError("");
    setIsEmailValid(true);
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required");
      setIsPasswordValid(false);
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      setIsPasswordValid(false);
      return false;
    }
    
    setPasswordError("");
    setIsPasswordValid(true);
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  const handleLogin = async () => {
    if (!isEmailValid || !isPasswordValid) return;

    const success = await login(email, password);

    if (!success) {
      Alert.alert("Login Failed", error || "Please check your credentials and try again");
      return;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        router.push("/auth/signup/verify");
        return;
      }
      try {
        await Purchases.logIn(credential.user.uid);
      } catch (e) {
        console.warn("RevenueCat logIn failed:", e);
      }
      router.replace("/(tabs)");
    } catch (firebaseError) {
      Alert.alert("Login Failed", error || "Please check your credentials and try again");
    }
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
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
          Welcome to WODGoat 🐐
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
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoComplete="password"
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        {/* Login Button */}
        <View style={styles.buttonSection}>
          <Button
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            variant="primary"
            size="large"
            disabled={loading || !isEmailValid || !isPasswordValid}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={[styles.forgotPasswordText]}>
              Forget Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.registerTextContainer}>
        <Text style={[styles.registerText]}>
          Don&apos;t have an account?{" "}
        </Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={[styles.registerLink]}>
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
    color: Colors.text.primary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: Colors.text.primary,
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
    color: Colors.text.primary,
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
    color: Colors.text.primary,
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanMedium
  },

  // Register Section
  registerTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: Colors.text.primary,
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.spartanMedium
  },
  registerLink: {
    color: Colors.primary[500],
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.spartanBold,
  },
  
  // Error Text
  errorText: {
    color: Colors.error[500],
    fontSize: responsiveSize(12),
    marginTop: 4,
  },
});
