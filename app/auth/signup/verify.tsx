import { Button, Page } from "@/components";
import { auth } from "@/config/firebase";
import { Colors, FontFamilies, Typography } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function VerifyScreen() {
  const { isCoach } = useLocalSearchParams<{ isCoach?: string }>();
  const isCoachApplication = isCoach === "1";

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

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
        router.dismissAll();
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
      setCooldown(60);
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
      
        {isCoachApplication && (
          <View>
            <Text style={styles.coachNoteTitle}>Coach Application Submitted</Text>
            <Text style={styles.coachNoteText}>
              Our team will contact you to review your application and finalize the coach agreement. Keep your phone available.
            </Text>
          </View>
        )}

        <View style={styles.spamNote}>
          <Text style={[styles.spamNoteText, Typography.bodyMedium]}>
            Can't find the email? Check your{" "}
            <Text style={styles.spamNoteHighlight}>spam or junk folder</Text>
            {" "}and mark it as "Not Spam" to ensure you receive all future emails from us.
          </Text>
        </View>


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
          title={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
          variant="secondary"
          size="large"
          fullWidth
          loading={isResending}
          disabled={cooldown > 0}
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
    paddingTop: 16,
  },
  title: {
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.secondary,
    marginBottom: 12,
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
  errorText: {
    color: Colors.text.error,
    fontSize: 14,
  },
  coachNote: {
    backgroundColor: Colors.text.success + "18",
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.text.success,
    gap: 4,
  },
  coachNoteTitle: {
    fontFamily: FontFamilies.spartanMedium,
    color: Colors.text.success,
    fontWeight: "600",
    fontSize: 16,
  },
  coachNoteText: {
    color: Colors.text.secondary,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: FontFamilies.spartanRegular,
  },
});
