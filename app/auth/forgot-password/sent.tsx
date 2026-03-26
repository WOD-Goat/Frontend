import { Button, Page } from "@/components";
import { auth } from "@/config/firebase";
import { Colors, FontFamilies, FontSizes, Typography } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordSentScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Reset link resent! Check your inbox.");
    } catch (e: any) {
      setMessage("Failed to resend. Please try again later.");
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
          We sent a password reset link to{"\n"}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
        <Text style={[styles.instructions, Typography.bodyMedium]}>
          Click the link in the email to reset your password. The link expires
          in 1 hour.
        </Text>

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <Button
          title="Back to Login"
          onPress={() => router.replace("/auth/login")}
          variant="primary"
          size="large"
          fullWidth
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn&apos;t receive it? </Text>
          <TouchableOpacity onPress={handleResend} disabled={isResending}>
            <Text style={styles.resendLink}>
              {isResending ? "Sending..." : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 8,
  },
  emailHighlight: {
    color: Colors.primary[500],
    fontFamily: FontFamilies.spartanBold,
  },
  instructions: {
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  messageText: {
    color: Colors.primary[500],
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanMedium,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resendLabel: {
    color: Colors.text.primary,
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.spartanMedium,
  },
  resendLink: {
    color: Colors.primary[500],
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.spartanBold,
  },
});
