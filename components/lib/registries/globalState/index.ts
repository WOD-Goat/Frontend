import { GlobalState } from "@/types/state";

/**
 * Global State Registry - maps to the GlobalState type
 * This is used by Zustand for type-safe state management
 */
export type GlobalStateRegistry = GlobalState;

export const defaultState: GlobalStateRegistry = {
  signupData: null,
};

export { GlobalStateProvider, useGlobalState } from "../../global-state";

