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
    ios: "test_xefpyQqkDiXYOIKrmCzlRWLzJRb",
    android: "test_xefpyQqkDiXYOIKrmCzlRWLzJRb",
    default: "test_xefpyQqkDiXYOIKrmCzlRWLzJRb",
  }) as string,
} as const;

/** Entitlement identifier configured in the RevenueCat dashboard */
export const ENTITLEMENTS = {
  PRO: "WODGoat Pro",
} as const;

/** Product identifiers as configured in App Store Connect / Google Play Console */
export const PRODUCT_IDS = {
  MONTHLY: "subscription_monthly",
  YEARLY: "subscription_yearly",
} as const;

/** Offering identifier configured in the RevenueCat dashboard */
export const OFFERING_IDS = {
  DEFAULT: "default",
} as const;
