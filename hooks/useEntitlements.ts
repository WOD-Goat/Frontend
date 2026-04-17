import {
  BooleanFeatureKey,
  FEATURE_CONFIG,
  Plan,
  PlanFeatures,
} from "@/config/features";
import { useGlobalState } from "@/components/lib";
import { CoachApplicationStatus } from "@/types/auth";
import { useCallback } from "react";
import { useRevenueCat } from "./useRevenueCat";


export interface UseEntitlementsReturn {
  /** Effective plan — combines RevenueCat (Athlete Pro) and userType (Coach) */
  plan: Plan;
  isPro: boolean;
  isAthletePro: boolean;
  /** True when the user's userType is "coach" (backend-approved, not RevenueCat) */
  isCoachPro: boolean;
  /** True when the user is a coach but their coachStatus is not 'active' */
  isCoachSuspended: boolean;
  /**
   * Why a suspended coach lost access:
   * - 'expired'  → coachSubscription.expiresAt exists and is in the past
   * - 'admin'    → manually suspended, no subscription record
   * - null       → not suspended
   */
  coachSuspensionReason: 'expired' | 'admin' | null;
  /** The user's coach application status */
  coachApplicationStatus: CoachApplicationStatus;
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
    plan: rcPlan,
    isPro: isAthletePro,
    isConfigured,
    isLoading,
    refreshCustomerInfo,
  } = useRevenueCat();

  const globalState = useGlobalState();
  const user = globalState.get("user");

  // Coach features are gated on coachStatus === 'active' (backend-set, not RevenueCat).
  const isCoach = user?.userType === "coach";
  const isCoachActive = isCoach && user?.coachStatus === "active";
  const isCoachSuspended = isCoach && user?.coachStatus === "suspended";
  const effectivePlan: Plan = isCoachActive ? "coach" : rcPlan;
  const isCoachPro = isCoachActive;

  const expiresAt = user?.coachSubscription?.expiresAt;
  const coachSuspensionReason: 'expired' | 'admin' | null = isCoachSuspended
    ? (expiresAt && new Date(expiresAt) < new Date() ? 'expired' : 'admin')
    : null;

  const coachApplicationStatus: CoachApplicationStatus =
    user?.coachApplication?.status ?? "none";

  const features = FEATURE_CONFIG[effectivePlan];

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
    plan: effectivePlan,
    isPro: isAthletePro || isCoachPro,
    isAthletePro,
    isCoachPro,
    isCoachSuspended,
    coachSuspensionReason,
    coachApplicationStatus,
    isReady: isConfigured,
    isLoading,
    features,
    canAccess,
    getLimit,
    withinLimit,
    refresh: refreshCustomerInfo,
  };
}
