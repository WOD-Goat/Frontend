import { ENTITLEMENTS } from "@/config/revenuecat";
import { useCallback, useEffect, useRef, useState } from "react";
import Purchases, {
    CustomerInfo,
    CustomerInfoUpdateListener,
    PurchasesOfferings,
} from "react-native-purchases";

/** Derive a human-readable message from any thrown value */
const toErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

export type Plan = "free" | "athlete" | "coach";

export interface RevenueCatState {
  /** Whether the SDK is ready to use */
  isConfigured: boolean;
  /** Whether a network/SDK operation is in progress */
  isLoading: boolean;
  /** Whether the user has any paid plan (athlete or coach) */
  isPro: boolean;
  /** Whether the user has an active Athlete Pro entitlement */
  isAthletePro: boolean;
  /** Whether the user has an active Coach Pro entitlement */
  isCoachPro: boolean;
  /** Current plan tier */
  plan: Plan;
  /** Full CustomerInfo object from RevenueCat */
  customerInfo: CustomerInfo | null;
  /** All available offerings fetched from RevenueCat */
  offerings: PurchasesOfferings | null;
  /** Last error from any SDK operation */
  error: string | null;
}

export interface UseRevenueCatReturn extends RevenueCatState {
  /** Re-fetch the latest CustomerInfo from RevenueCat servers */
  refreshCustomerInfo: () => Promise<void>;
  /** Fetch all available offerings */
  fetchOfferings: () => Promise<PurchasesOfferings | null>;
  /** Restore previous purchases for the current user */
  restorePurchases: () => Promise<CustomerInfo | null>;
  /** Log in to RevenueCat with a known app user ID (call after your own auth) */
  loginUser: (appUserId: string) => Promise<void>;
  /** Log out the current user (resets to anonymous) */
  logoutUser: () => Promise<void>;
  /** Clear any stored error */
  clearError: () => void;
}

/**
 * useRevenueCat
 *
 * Central hook for all RevenueCat subscription state. Reads from the SDK's
 * listener rather than polling so it stays up-to-date automatically.
 *
 * Usage:
 *   const { isPro, customerInfo, fetchOfferings } = useRevenueCat();
 */
export const useRevenueCat = (): UseRevenueCatReturn => {
  // Keep a stable ref to the listener so we can remove it on unmount
  const listenerRef = useRef<CustomerInfoUpdateListener | null>(null);

  const [state, setState] = useState<RevenueCatState>({
    isConfigured: false,
    isLoading: false,
    isPro: false,
    isAthletePro: false,
    isCoachPro: false,
    plan: "free",
    customerInfo: null,
    offerings: null,
    error: null,
  });

  // ── Helper to derive plan from CustomerInfo ───────────────────────────────
  const derivePlan = (info: CustomerInfo): Pick<RevenueCatState, "isPro" | "isAthletePro" | "isCoachPro" | "plan"> => {
    const isCoachPro = info.entitlements.active[ENTITLEMENTS.COACH_PRO] !== undefined;
    const isAthletePro = isCoachPro || info.entitlements.active[ENTITLEMENTS.ATHLETE_PRO] !== undefined;
    const plan: Plan = isCoachPro ? "coach" : isAthletePro ? "athlete" : "free";
    return { isPro: isAthletePro || isCoachPro, isAthletePro, isCoachPro, plan };
  };

  // ── Subscribe to CustomerInfo updates ────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        setState((prev) => ({
          ...prev,
          isConfigured: true,
          customerInfo: info,
          ...derivePlan(info),
        }));
      } catch {
        // SDK not yet configured – _layout.tsx configures it
      }
    };

    init();

    // Real-time listener for entitlement changes
    const listener: CustomerInfoUpdateListener = (info) => {
      setState((prev) => ({
        ...prev,
        isConfigured: true,
        customerInfo: info,
        ...derivePlan(info),
      }));
    };

    listenerRef.current = listener;
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      if (listenerRef.current) {
        Purchases.removeCustomerInfoUpdateListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const refreshCustomerInfo = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const info = await Purchases.getCustomerInfo();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        customerInfo: info,
        ...derivePlan(info),
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: toErrorMessage(err),
      }));
    }
  }, []);

  const fetchOfferings =
    useCallback(async (): Promise<PurchasesOfferings | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const offerings = await Purchases.getOfferings();
        setState((prev) => ({ ...prev, isLoading: false, offerings }));
        return offerings;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: toErrorMessage(err),
        }));
        return null;
      }
    }, []);

  const restorePurchases =
    useCallback(async (): Promise<CustomerInfo | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const info = await Purchases.restorePurchases();
        setState((prev) => ({
          ...prev,
          isLoading: false,
          customerInfo: info,
          ...derivePlan(info),
        }));
        return info;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: toErrorMessage(err),
        }));
        return null;
      }
    }, []);

  const loginUser = useCallback(async (appUserId: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { customerInfo } = await Purchases.logIn(appUserId);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        customerInfo,
        ...derivePlan(customerInfo),
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: toErrorMessage(err),
      }));
    }
  }, []);

  const logoutUser = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const info = await Purchases.logOut();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        customerInfo: info,
        ...derivePlan(info),
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: toErrorMessage(err),
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    refreshCustomerInfo,
    fetchOfferings,
    restorePurchases,
    loginUser,
    logoutUser,
    clearError,
  };
};
