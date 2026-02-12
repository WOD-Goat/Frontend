/**
 * Global Application State Types
 * Represents all in-memory state managed by Zustand
 */

import { RegisterUserData } from "./auth";

export interface GlobalState {
  signupData: Partial<RegisterUserData> | null;
}
