/**
 * Global Application State Types
 * Represents all in-memory state managed by Zustand
 */

import { SignupFormData, User } from "./auth";
import { Group } from "./group";
import { PersonalRecord } from "./personalRecord";
import { AssignedWorkoutData } from "./workout";

export interface GlobalState {
  signupData: Partial<SignupFormData> | null;
  user: User | null;
  workouts: AssignedWorkoutData[] | null;
  groups: Group[] | null;
  personalRecords: PersonalRecord[] | null;
  // Add more user-related data as needed
  // stats?: UserStats | null;
  // chats?: ChatData[] | null;
}
