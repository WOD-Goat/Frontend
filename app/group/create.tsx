import { groupsService } from "@/api/services";
import { Button, Input, Page } from "@/components";
import { useToast } from "@/components/lib/toast/ToastProvider";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [adminParticipates, setAdminParticipates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleCreate = async () => {
    if (!groupName.trim()) {
      showToast({ type: "error", label: "Please enter a group name" });
      return;
    }
    try {
      setLoading(true);
      const response = await groupsService.createGroup({ name: groupName.trim(), adminParticipates });
      if (response.success && response.data) {
        setJoinCode(response.data.joinCode ?? null);
        showToast({ type: "success", label: "Group created!" });
      } else {
        showToast({ type: "error", label: response.message || "Failed to create group" });
      }
    } catch (err: any) {
      showToast({ type: "error", label: err.message || "Failed to create group" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!joinCode) return;
    await Share.share({ message: joinCode });
  };

  const handleShare = async () => {
    if (!joinCode) return;
    await Share.share({ message: `Join my WODGoat group with code: ${joinCode}` });
  };

  if (joinCode) {
    return (
      <Page title="Group Created" showBackButton={true}>
        <View style={styles.successContainer}>
          <View style={styles.successIconRing}>
            <Ionicons name="checkmark-circle" size={52} color={Colors.success[500]} />
          </View>
          <Text style={styles.successTitle}>{groupName}</Text>
          <Text style={styles.successSubtitle}>Share this code with your team</Text>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Join Code</Text>
            <Text style={styles.codeValue}>{joinCode}</Text>
            <Text style={styles.codeHint}>Single-use · Auto-expires after joining</Text>
          </View>

          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.codeActionBtn} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={20} color={Colors.primary[500]} />
              <Text style={styles.codeActionText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.codeActionBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={Colors.primary[500]} />
              <Text style={styles.codeActionText}>Share</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Go to Groups"
            variant="primary"
            size="large"
            fullWidth
            onPress={() => {
              router.dismissAll();
              router.replace("/(tabs)/groups");
            }}
          />
        </View>
      </Page>
    );
  }

  return (
    <Page
      title="Create Group"
      showBackButton={true}
      footer={
        <Button
          title={loading ? "Creating..." : "Create Group"}
          variant="primary"
          size="large"
          fullWidth
          disabled={!groupName.trim() || loading}
          onPress={handleCreate}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.iconSection}>
          <View style={styles.iconRing}>
            <Ionicons name="people" size={36} color={Colors.primary[500]} />
          </View>
          <Text style={styles.description}>
            Create a group, invite members with a join code, and post workouts
            for everyone to complete.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Group Name</Text>
          <Input
            placeholder='e.g., "Morning Squad" or "Box Athletes"'
            value={groupName}
            onChangeText={setGroupName}
            autoFocus
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.label}>Participate in workouts</Text>
              <Text style={styles.switchSubtext}>
                Add group workouts to your own workouts screen
              </Text>
            </View>
            <Switch
              value={adminParticipates}
              onValueChange={setAdminParticipates}
              trackColor={{ false: Colors.neutral[700], true: Colors.primary[500] + "80" }}
              thumbColor={adminParticipates ? Colors.primary[500] : Colors.neutral[500]}
            />
          </View>
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  switchInfo: {
    flex: 1,
    gap: 3,
  },
  switchSubtext: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
    gap: 16,
  },
  successIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.success[500] + "15",
    borderWidth: 1.5,
    borderColor: Colors.success[500] + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
  },
  successSubtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
  codeCard: {
    width: "100%",
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "40",
    gap: 8,
    marginVertical: 8,
  },
  codeLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  codeValue: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: responsiveSize(36),
    color: Colors.primary[500],
    letterSpacing: 8,
  },
  codeHint: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: responsiveSize(11),
    color: Colors.text.secondary,
  },
  codeActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  codeActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "50",
    backgroundColor: Colors.primary[500] + "15",
  },
  codeActionText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.primary[500],
  },
});
