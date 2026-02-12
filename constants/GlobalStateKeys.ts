/**
 * Global State Keys used throughout the application
 * These correspond to Zustand store keys for in-memory state
 */
export const GLOBAL_STATE_KEYS = {} as const;

// Export type for global state key names
export type GlobalStateKey =
  (typeof GLOBAL_STATE_KEYS)[keyof typeof GLOBAL_STATE_KEYS];
