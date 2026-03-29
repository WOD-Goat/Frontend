import { BooleanFeatureKey, PlanFeatures } from "@/config/features";
import { presentPaywall } from "@/app/paywall";
import { useCallback } from "react";
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
}

export function useFeatureGuard(): UseFeatureGuardReturn {
  const { canAccess, withinLimit, refresh, isReady } = useEntitlements();

  const guard = useCallback(
    async (
      feature: BooleanFeatureKey,
      action: () => void | Promise<void>,
    ): Promise<void> => {
      if (canAccess(feature)) {
        await action();
        return;
      }
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

  return { guard, guardLimit, canAccess, withinLimit, isReady };
}
