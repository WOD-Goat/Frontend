/**
 * Storage Keys used throughout the application
 * These correspond to AsyncStorage keys for persistent data
 */
export const STORAGE_KEYS = {
  TOKEN: "token",
  LOCALE: "locale",
  IS_LOGGED_IN: "isLoggedIn",
  USER: "user",
} as const;

// Export type for storage key names
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
