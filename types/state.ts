/**
 * Global Application State Types
 * Represents all in-memory state managed by Zustand
 */

import { RegisterUserData, User } from "./auth";
import { Group } from "./group";
import { PersonalRecord } from "./personalRecord";
import { AssignedWorkout } from "./workout";

export interface GlobalState {
  signupData: Partial<RegisterUserData> | null;
  user: User | null;
  workouts: AssignedWorkout[] | null;
  groups: Group[] | null;
  personalRecords: PersonalRecord[] | null;
  // Add more user-related data as needed
  // stats?: UserStats | null;
  // chats?: ChatData[] | null;
}
