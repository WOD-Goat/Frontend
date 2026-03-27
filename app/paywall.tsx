import { Colors } from "@/constants";
import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

/**
 * PaywallScreen
 *
 * A full-screen route that embeds the RevenueCat Paywall component.
 * The paywall is configured remotely on the RevenueCat dashboard so no
 * product data or copy lives here.
 *
 * Navigate to this screen with: router.push("/paywall")
 *
 * For a faster one-liner that doesn't require navigation updates, use the
 * `presentPaywall` / `presentPaywallIfNeeded` helpers in
 * `utils/revenueCatHelpers.ts` instead.
 */
export default function PaywallScreen() {
  const handleDismiss = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, []);

  const handlePurchaseCompleted = useCallback(() => {
    console.log("💰 PaywallScreen: Purchase completed – user is now Pro");
    handleDismiss();
  }, [handleDismiss]);

  const handleRestoreCompleted = useCallback(() => {
    console.log("🔄 PaywallScreen: Purchases restored");
    handleDismiss();
  }, [handleDismiss]);

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        onDismiss={handleDismiss}
        onPurchaseCompleted={({ customerInfo }) => {
          console.log(
            "💰 Purchase completed, entitlements:",
            Object.keys(customerInfo.entitlements.active),
          );
          handlePurchaseCompleted();
        }}
        onPurchaseError={({ error }) => {
          console.error("❌ Purchase error:", error.message);
        }}
        onPurchaseCancelled={() => {
          console.log("🚫 Purchase cancelled by user");
        }}
        onRestoreCompleted={({ customerInfo }) => {
          console.log(
            "🔄 Restore completed, entitlements:",
            Object.keys(customerInfo.entitlements.active),
          );
          handleRestoreCompleted();
        }}
        onRestoreError={({ error }) => {
          console.error("❌ Restore error:", error.message);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Imperative helpers – use these when you don't want to push a route
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Presents the RevenueCat paywall modally.
 * Returns `true` if the user purchased or restored, `false` otherwise.
 */
export async function presentPaywall(offering?: object): Promise<boolean> {
  const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall(
    offering ? { offering: offering as any } : undefined,
  );
  return (
    result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED
  );
}

/**
 * Presents the paywall ONLY if the user does not have the given entitlement.
 * Returns `true` if the user purchased, restored, or already had access.
 * @param requiredEntitlementIdentifier - defaults to "WODGoat Pro"
 */
export async function presentPaywallIfNeeded(
  requiredEntitlementIdentifier = "WODGoat Pro",
  offering?: object,
): Promise<boolean> {
  const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier,
    ...(offering ? { offering: offering as any } : {}),
  });

  switch (result) {
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
    case PAYWALL_RESULT.NOT_PRESENTED: // user already has the entitlement
      return true;
    default:
      return false;
  }
}
