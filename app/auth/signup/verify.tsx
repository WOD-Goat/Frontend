import { Button, Page } from "@/components";
import { auth } from "@/config/firebase";
import { Colors, Typography } from "@/constants";
import { router } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function VerifyScreen() {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    setIsChecking(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Session expired. Please log in again.");
        return;
      }
      await user.reload();
      if (user.emailVerified) {
        router.replace("/(tabs)");
      } else {
        setError(
          "Email not verified yet. Please check your inbox and click the link.",
        );
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Session expired. Please log in again.");
        return;
      }
      await sendEmailVerification(user);
      setError("Verification email resent! Check your inbox.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Page>
      <View style={styles.container}>
        <Text style={[styles.title, Typography.displaySmall]}>
          Check your email ✉️
        </Text>
        <Text style={[styles.subtitle, Typography.bodyMedium]}>
          We sent a verification link to your email address. Click the link then
          come back and press Continue.
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="Continue →"
          variant="primary"
          size="large"
          fullWidth
          loading={isChecking}
          onPress={handleContinue}
        />

        <Button
          title="Resend Email"
          variant="secondary"
          size="large"
          fullWidth
          loading={isResending}
          onPress={handleResend}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingTop: 40,
  },
  title: {
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  errorText: {
    color: Colors.text.error,
    fontSize: 14,
  },
});
