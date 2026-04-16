import { groupsService } from "@/api/services";
import { Button, Input, Page } from "@/components";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";

export default function JoinGroupScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleJoin = async () => {
    Keyboard.dismiss();
    if (code.trim().length !== 6) {
      showToast({
        type: "error",
        label: "Please enter a valid 6-character code",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await groupsService.joinGroup(code.trim().toUpperCase());
      if (response.success && response.data) {
        showToast({ type: "success", label: `Joined Group Successfully!` });
        router.dismissAll();
        router.replace("/(tabs)/groups");
      } else {
        showToast({
          type: "error",
          label: response.message || "Failed to join group",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        label: err.message || "Failed to join group",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      title="Join Group"
      showBackButton={true}
      footer={
        <Button
          title={loading ? "Joining..." : "Join Group"}
          variant="primary"
          size="large"
          fullWidth
          disabled={code.trim().length !== 6 || loading}
          onPress={handleJoin}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.iconSection}>
          <View style={styles.iconRing}>
            <Ionicons
              name="enter-outline"
              size={36}
              color={Colors.primary[500]}
            />
          </View>
          <Text style={styles.description}>
            Enter the 6-character code shared by your group admin to join their
            group and access their workouts.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Join Code</Text>
          <Input
            placeholder="XXXXXX"
            value={code}
            onChangeText={(text) =>
              setCode(text.toUpperCase().replace(/[^A-Z0-9]/g, ""))
            }
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            autoFocus
          />
          <Text style={styles.hint}>Codes are case-insensitive</Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 28,
  },
  iconSection: {
    alignItems: "center",
    paddingTop: 16,
    gap: 16,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[500] + "15",
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  formSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  label: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  hint: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
});
