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
    android: "test_xefpyQqkDiXYOIKrmCzlRWLzJRb",
    default: "test_xefpyQqkDiXYOIKrmCzlRWLzJRb",
  }) as string,
} as const;

/** Entitlement identifiers configured in the RevenueCat dashboard */
export const ENTITLEMENTS = {
  ATHLETE_PRO: "Athlete Pro",
  COACH_PRO: "Coach Pro",
} as const;

/** Product identifiers as configured in App Store Connect / Google Play Console */
export const PRODUCT_IDS = {
  ATHLETE_MONTHLY: "athlete_pro_monthly",
  ATHLETE_YEARLY: "athlete_pro_annually",
  COACH_MONTHLY: "coach_pro_monthly",
  COACH_YEARLY: "coach_pro_annually",
} as const;

/** Offering identifier configured in the RevenueCat dashboard */
export const OFFERING_IDS = {
  DEFAULT: "default",
} as const;
