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

export interface RevenueCatState {
  /** Whether the SDK is ready to use */
  isConfigured: boolean;
  /** Whether a network/SDK operation is in progress */
  isLoading: boolean;
  /** Whether the current user has an active "WODGoat Pro" entitlement */
  isPro: boolean;
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
    customerInfo: null,
    offerings: null,
    error: null,
  });

  // ── Helper to derive isPro from CustomerInfo ─────────────────────────────
  const deriveIsPro = (info: CustomerInfo): boolean => {
    return info.entitlements.active[ENTITLEMENTS.PRO] !== undefined;
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
          isPro: deriveIsPro(info),
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
        isPro: deriveIsPro(info),
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
        isPro: deriveIsPro(info),
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
          isPro: deriveIsPro(info),
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
        isPro: deriveIsPro(customerInfo),
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
        isPro: deriveIsPro(info),
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
