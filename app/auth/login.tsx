import { Button, Input, Page } from "@/components";
import { Typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
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
    if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter");
      setIsPasswordValid(false);
      return false;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      setIsPasswordValid(false);
      return false;
    }
    if (!/(?=.*\d)/.test(password)) {
      setPasswordError("Password must contain at least one number");
      setIsPasswordValid(false);
      return false;
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      setPasswordError("Password must contain at least one special character (@$!%*?&)");
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
    console.log('📱 LoginScreen: handleLogin called');
    console.log('📱 LoginScreen: Email valid:', isEmailValid, 'Password valid:', isPasswordValid);
    
    // Only proceed if both fields are already valid
    if (!isEmailValid || !isPasswordValid) {
      console.log('📱 LoginScreen: Validation failed, not proceeding with login');
      return;
    }

    console.log('📱 LoginScreen: Calling login with:', { email, password: '***' });
    const success = await login(email, password);
    
    console.log('📱 LoginScreen: Login result:', success);

    if (success) {
      console.log('📱 LoginScreen: Login successful, navigating to tabs');
      router.replace("/(tabs)");
    } else {
      console.log('📱 LoginScreen: Login failed, error:', error);
      Alert.alert("Login Failed", error || "Please check your credentials and try again");
    }
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
    console.log("Forgot password pressed");
  };

  const handleRegister = () => {
    // Navigate to register screen
    router.push("/auth/aa");
  };

  return (
    <Page>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, Typography.displaySmall]}>
          Welcome to WODGoat 💛
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
            variant="secondary"
            size="large"
            disabled={loading || !isEmailValid || !isPasswordValid}
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
          Don&apos;t have an account?{" "}
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
  
  // Error Text
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: 4,
  },
});
