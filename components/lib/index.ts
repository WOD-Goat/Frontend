/**
 * Main lib exports
 * Central point for accessing all state management hooks and utilities
 */

// Global State Management
export { GlobalStateProvider, useGlobalState } from "./global-state";
export type { GlobalStateControls } from "./global-state";

// Toast
export { ToastProvider, useToast } from "./toast/ToastProvider";

// Persistent Storage
export { storage, useStorage } from "./storage";
export type { StorageControls } from "./storage";

// Registries (type definitions)
export * from "./registries";

