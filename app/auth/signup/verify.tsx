import { Button, Page } from "@/components";
import { Text } from "react-native";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { auth } from "@/config/firebase";


export default function VerifyScreen() {
  async function checkEmailVerified(): Promise<boolean> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user is currently logged in.");
    }

    // Refresh the user's data from Firebase
    await user.reload();

    // Return whether email is verified
    return user.emailVerified;
  }

  return (
    <Page>
      <Text>Verify your email</Text>
      <Button
        title="Resend Verification Email"
        onPress={async () => {
          try {
            console.log("Attempting to resend verification email...");
            await sendEmailVerification(auth.currentUser!);
            alert("Verification email resent! Check your inbox.");
          } catch (error: any) {
            console.error("Failed to resend verification email:", error);
            alert("Error sending email: " + error.message);
          }

        //    checkEmailVerified().then((verified) => {
        //     console.log("Email verified:", verified);
        //   });
        }}
      />
    </Page>
  );
}
