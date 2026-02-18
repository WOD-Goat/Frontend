/**
 * Global Application State Types
 * Represents all in-memory state managed by Zustand
 */

import { RegisterUserData, User } from "./auth";

export interface GlobalState {
  signupData: Partial<RegisterUserData> | null;
  user: User | null;
  // Add more user-related data as needed
  // stats?: UserStats | null;
  // workouts?: WorkoutData[] | null;
  // chats?: ChatData[] | null;
}
