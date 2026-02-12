/**
 * Main lib exports
 * Central point for accessing all state management hooks and utilities
 */

// Global State Management
export {
    GlobalStateProvider, useGlobalState,
    useGlobalStateContext
} from "./global-state";
export type { GlobalStateControls } from "./global-state";

// Persistent Storage
export { storage, useStorage } from "./storage";
export type { StorageControls } from "./storage";

// Registries (type definitions)
export * from "./registries";

