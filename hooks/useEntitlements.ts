import {
  BooleanFeatureKey,
  FEATURE_CONFIG,
  PlanFeatures,
} from "@/config/features";
import { useCallback } from "react";
import { useRevenueCat } from "./useRevenueCat";

export interface UseEntitlementsReturn {
  /** Current subscription plan */
  plan: "free" | "athlete" | "coach";
  isPro: boolean;
  isAthletePro: boolean;
  isCoachPro: boolean;
  /** True once the RevenueCat SDK has finished initializing */
  isReady: boolean;
  /** True during a refresh/restore network call */
  isLoading: boolean;
  /** The full feature set for the current plan */
  features: PlanFeatures;
  /**
   * Check a boolean feature flag.
   * O(1) synchronous lookup — no network calls.
   */
  canAccess: (key: BooleanFeatureKey) => boolean;
  /**
   * Get the raw limit value for a numeric feature.
   * Returns null if the plan has unlimited access.
   */
  getLimit: <K extends keyof PlanFeatures>(key: K) => PlanFeatures[K];
  /**
   * Returns true if `current` is within the plan's limit for `key`.
   * Always returns true when the limit is null (unlimited).
   */
  withinLimit: (key: keyof PlanFeatures, current: number) => boolean;
  /** Force-fetch latest entitlements from RevenueCat servers. */
  refresh: () => Promise<void>;
}

export function useEntitlements(): UseEntitlementsReturn {
  const {
    plan,
    isPro,
    isAthletePro,
    isCoachPro,
    isConfigured,
    isLoading,
    refreshCustomerInfo,
  } = useRevenueCat();

  const features = FEATURE_CONFIG[plan];

  const canAccess = useCallback(
    (key: BooleanFeatureKey): boolean => features[key] as boolean,
    [features],
  );

  const getLimit = useCallback(
    <K extends keyof PlanFeatures>(key: K): PlanFeatures[K] => features[key],
    [features],
  );

  const withinLimit = useCallback(
    (key: keyof PlanFeatures, current: number): boolean => {
      const limit = features[key];
      if (limit === null) return true;
      if (typeof limit === "boolean") return limit;
      return current < (limit as number);
    },
    [features],
  );

  return {
    plan,
    isPro,
    isAthletePro,
    isCoachPro,
    isReady: isConfigured,
    isLoading,
    features,
    canAccess,
    getLimit,
    withinLimit,
    refresh: refreshCustomerInfo,
  };
}
