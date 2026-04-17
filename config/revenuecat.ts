import { Platform } from "react-native";

/**
 * RevenueCat Configuration
 *
 * API Keys are platform-specific. Add your iOS and Android keys below.
 * Project dashboard: https://app.revenuecat.com
 */
export const REVENUECAT_CONFIG = {
  // Platform-specific API keys from the RevenueCat dashboard
  // Swap these for your production keys when going live
  apiKey: Platform.select({
    ios: "appl_dxhZNxnTIDRBkSNzIjAwLWPggBc",
    android: "goog_NlFKZMONnfwhqZnbnypSwqKcGqd",
    default: "test_xefpyQqkDiXYOIKrmCzlRWLzJRb",
  }) as string,
} as const;

/** Entitlement identifiers configured in the RevenueCat dashboard */
export const ENTITLEMENTS = {
  ATHLETE_PRO: "Athlete Pro",
  // Coach access is now userType-based (backend-approved), not a RevenueCat entitlement
} as const;

/** Product identifiers as configured in App Store Connect / Google Play Console */
export const PRODUCT_IDS = {
  ATHLETE_MONTHLY: "athlete_pro_monthly",
  ATHLETE_YEARLY: "athlete_pro_annually",
  // Coach Pro products removed — coach onboarding is handled outside the app
} as const;

/** Offering identifier configured in the RevenueCat dashboard */
export const OFFERING_IDS = {
  DEFAULT: "default",
} as const;
