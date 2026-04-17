import {
  BooleanFeatureKey,
  FEATURE_UPGRADE_HINTS,
} from "@/config/features";
import { useEntitlements } from "@/hooks/useEntitlements";
import { presentPaywall } from "@/app/paywall";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FeatureGateProps {
  /** The boolean feature to check */
  feature: BooleanFeatureKey;
  /**
   * What to show when access is denied.
   * - "none" (default): renders nothing
   * - "upgrade-prompt": renders an inline upgrade card
   * - ReactNode: custom fallback element
   */
  fallback?: "none" | "upgrade-prompt" | React.ReactNode;
  /**
   * When true, renders children at reduced opacity with a lock overlay
   * instead of hiding/replacing them. Good for feature discovery.
   */
  preview?: boolean;
  children: React.ReactNode;
}

export function FeatureGate({
  feature,
  fallback = "none",
  preview = false,
  children,
}: FeatureGateProps) {
  const { canAccess } = useEntitlements();
  const hasAccess = canAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (preview) {
    return (
      <View style={styles.previewWrapper}>
        <View style={styles.previewDimmed} pointerEvents="none">
          {children}
        </View>
        <LockOverlay feature={feature} />
      </View>
    );
  }

  if (fallback === "none") return null;

  if (fallback === "upgrade-prompt") {
    return <UpgradePromptCard feature={feature} />;
  }

  return <>{fallback}</>;
}

// ─── Internal: Upgrade Prompt Card ───────────────────────────────────────────

function UpgradePromptCard({ feature }: { feature: BooleanFeatureKey }) {
  const hint = FEATURE_UPGRADE_HINTS[feature];
  const isCoachFeature = hint.requiredPlan === "coach";
  const { coachSuspensionReason } = useEntitlements();
  const suspensionReason = isCoachFeature ? coachSuspensionReason : null;

  const suspensionMessage =
    suspensionReason === 'expired'
      ? "Your coach subscription has expired. Contact the WODGoat team to resubscribe."
      : suspensionReason === 'admin'
      ? "Your account has been suspended. Please contact the WODGoat team."
      : null;

  const handleAction = async () => {
    if (suspensionReason === 'expired') {
      Alert.alert("Subscription Expired", suspensionMessage!);
    } else if (suspensionReason === 'admin') {
      Alert.alert("Account Suspended", suspensionMessage!);
    } else if (isCoachFeature) {
      Alert.alert("Coach Feature", hint.message);
    } else {
      await presentPaywall();
    }
  };

  return (
    <View style={styles.upgradeCard}>
      <View style={styles.upgradeIconRow}>
        <View style={styles.upgradeIconBg}>
          <Ionicons name="lock-closed" size={20} color={Colors.primary[500]} />
        </View>
        <View style={styles.upgradeBadge}>
          <Text style={styles.upgradeBadgeText}>
            {suspensionReason ? "Suspended" : hint.label}
          </Text>
        </View>
      </View>
      <Text style={styles.upgradeMessage}>
        {suspensionMessage ?? hint.message}
      </Text>
      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={handleAction}
        activeOpacity={0.8}
      >
        <Ionicons name={isCoachFeature ? "information-circle-outline" : "sparkles"} size={14} color="#000" />
        <Text style={styles.upgradeButtonText}>
          {suspensionReason ? "Contact Us" : isCoachFeature ? "Learn More" : "Upgrade Now"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Internal: Lock Overlay ───────────────────────────────────────────────────

function LockOverlay({ feature }: { feature: BooleanFeatureKey }) {
  const hint = FEATURE_UPGRADE_HINTS[feature];
  const isCoachFeature = hint.requiredPlan === "coach";
  const { coachSuspensionReason } = useEntitlements();
  const suspensionReason = isCoachFeature ? coachSuspensionReason : null;

  const handleAction = async () => {
    if (suspensionReason === 'expired') {
      Alert.alert("Subscription Expired", "Your coach subscription has expired. Please contact the WODGoat team to resubscribe.");
    } else if (suspensionReason === 'admin') {
      Alert.alert("Account Suspended", "Your account has been suspended. Please contact the WODGoat team.");
    } else if (isCoachFeature) {
      Alert.alert("Coach Feature", hint.message);
    } else {
      await presentPaywall();
    }
  };

  return (
    <TouchableOpacity
      style={styles.lockOverlay}
      onPress={handleAction}
      activeOpacity={0.85}
    >
      <View style={styles.lockIconBg}>
        <Ionicons name="lock-closed" size={22} color={Colors.primary[500]} />
      </View>
      <Text style={styles.lockLabel}>Tap to unlock</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Preview mode
  previewWrapper: {
    position: "relative",
  },
  previewDimmed: {
    opacity: 0.3,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  lockIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "60",
    alignItems: "center",
    justifyContent: "center",
  },
  lockLabel: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },

  // Upgrade prompt card
  upgradeCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "30",
    gap: 10,
  },
  upgradeIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  upgradeIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500] + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeBadge: {
    backgroundColor: Colors.primary[500] + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  upgradeBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyXS,
    color: Colors.primary[500],
  },
  upgradeMessage: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary[500],
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  upgradeButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: "#000000",
  },
});
