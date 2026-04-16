import { Button, Page } from "@/components";
import { auth } from "@/config/firebase";
import { Colors, FontFamilies, FontSizes, Typography } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordSentScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Reset link resent! Check your inbox.");
      setCooldown(60);
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

        <View style={styles.spamNote}>
          <Text style={[styles.spamNoteText, Typography.bodyMedium]}>
            Can't find the email? Check your{" "}
            <Text style={styles.spamNoteHighlight}>spam or junk folder</Text>
            {" "}and mark it as "Not Spam" to ensure you receive all future emails from us.
          </Text>
        </View>

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
          <TouchableOpacity onPress={handleResend} disabled={isResending || cooldown > 0}>
            <Text style={[styles.resendLink, cooldown > 0 && styles.resendLinkDisabled]}>
              {isResending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
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
  spamNote: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  spamNoteText: {
    color: Colors.text.secondary,
  },
  spamNoteHighlight: {
    color: Colors.primary[500],
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
  resendLinkDisabled: {
    color: Colors.text.secondary,
  },
});
