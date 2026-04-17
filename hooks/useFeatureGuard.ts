import { BooleanFeatureKey, FEATURE_UPGRADE_HINTS, PlanFeatures } from "@/config/features";
import { presentPaywall } from "@/app/paywall";
import { useCallback } from "react";
import { Alert } from "react-native";
import { useEntitlements } from "./useEntitlements";

export interface UseFeatureGuardReturn {
  /**
   * Imperative boolean feature guard.
   *
   * - If the user has access: runs `action` immediately.
   * - If not: shows the paywall. If purchased/restored, calls `refresh()`
   *   then runs `action`. If dismissed without purchase, does nothing.
   */
  guard: (
    feature: BooleanFeatureKey,
    action: () => void | Promise<void>,
  ) => Promise<void>;

  /**
   * Imperative numeric limit guard.
   *
   * - If `current` is within the plan's limit: runs `action` immediately.
   * - If at/over limit: shows the paywall. If purchased/restored, calls
   *   `refresh()` then runs `action`.
   */
  guardLimit: (
    limitKey: keyof PlanFeatures,
    current: number,
    action: () => void | Promise<void>,
  ) => Promise<void>;

  /** Synchronous access check (no side effects). */
  canAccess: (key: BooleanFeatureKey) => boolean;

  /** Synchronous within-limit check (no side effects). */
  withinLimit: (key: keyof PlanFeatures, current: number) => boolean;

  /** True once the RevenueCat SDK has finished initializing and the real plan is known. */
  isReady: boolean;
  /** True when the user is a coach whose subscription has been suspended. */
  isCoachSuspended: boolean;
  coachSuspensionReason: 'expired' | 'admin' | null;
}

export function useFeatureGuard(): UseFeatureGuardReturn {
  const { canAccess, withinLimit, refresh, isReady, isCoachSuspended, coachSuspensionReason } = useEntitlements();

  const guard = useCallback(
    async (
      feature: BooleanFeatureKey,
      action: () => void | Promise<void>,
    ): Promise<void> => {
      if (canAccess(feature)) {
        await action();
        return;
      }
      const hint = FEATURE_UPGRADE_HINTS[feature];
      if (hint.requiredPlan === "coach") {
        if (coachSuspensionReason === 'expired') {
          Alert.alert("Subscription Expired", "Your coach subscription has expired. Please contact the WODGoat team to resubscribe.");
        } else if (coachSuspensionReason === 'admin') {
          Alert.alert("Account Suspended", "Your account has been suspended. Please contact the WODGoat team.");
        } else {
          Alert.alert("Coach Feature", hint.message);
        }
        return;
      }
      // Athlete Pro features: show RevenueCat paywall
      const purchased = await presentPaywall();
      if (purchased) {
        await refresh();
        await action();
      }
    },
    [canAccess, refresh],
  );

  const guardLimit = useCallback(
    async (
      limitKey: keyof PlanFeatures,
      current: number,
      action: () => void | Promise<void>,
    ): Promise<void> => {
      if (withinLimit(limitKey, current)) {
        await action();
        return;
      }
      const purchased = await presentPaywall();
      if (purchased) {
        await refresh();
        await action();
      }
    },
    [withinLimit, refresh],
  );

  return { guard, guardLimit, canAccess, withinLimit, isReady, isCoachSuspended, coachSuspensionReason };
}
