// Group Types
import type { ResultData, TrackingType, WODData } from "./workout";

export interface Group {
  id?: string;
  name: string;
  createdBy: string;
  memberIds?: string[];   // list endpoints (getMyGroups / getMemberGroups)
  members?: GroupMember[]; // detail endpoint (getGroupById)
  joinCode?: string;
  createdAt: Date;
  latestWorkoutDate?: Date | null;
}

// Group response types for API
export interface GroupResponse {
  success: boolean;
  data: Group;
  message?: string;
}

export interface GroupsResponse {
  success: boolean;
  data: Group[];
  message?: string;
}

// Group creation/update types
export interface CreateGroupData {
  name: string;
}

export interface UpdateGroupData {
  name?: string;
}

// Group member types
export interface GroupMember {
  uid: string;
  name: string | null;
  nickname: string | null;
  profilePictureUrl: string | null;
  isAdmin: boolean;
}

export type GroupWithMembers = Group;

export interface GroupMembersResponse {
  success: boolean;
  data: Group;
  message?: string;
}

export interface UserResult {
  userId: string;
  userName: string;
  userProfilePictureUrl?: string | null;
  submittedAt: Date;
  results: ResultData[];
}

// Group Workout types
export interface GroupWorkout {
  id?: string;
  groupId: string;
  title?: string | null;
  scheduledFor: Date;
  notes?: string | null;
  wodType?: "structured" | "raw";
  rawText?: string | null;
  wods: WODData[];
  createdBy: string;
  createdAt: Date;
  hasSubmitted?: boolean;
  userResult?: UserResult | null;
}

export interface GroupWorkoutResponse {
  success: boolean;
  data: GroupWorkout;
  message?: string;
}

export interface GroupWorkoutsResponse {
  success: boolean;
  data: GroupWorkout[];
  message?: string;
}

export interface CreateGroupWorkoutData {
  title?: string | null;
  scheduledFor: Date;
  notes?: string | null;
  wodType?: "structured" | "raw";
  rawText?: string | null;
  wods: WODData[];
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  profilePicture?: string | null;
  weight?: number | null;
  reps?: number | null;
  estimated1RM?: number | null;
  timeInSeconds?: number | null;
  distanceMeters?: number | null;
  calories?: number | null;
}

export interface LeaderboardExercise {
  wodIndex: number;
  wodName: string;
  exerciseIndex: number;
  exerciseName: string;
  trackingType: TrackingType;
  rankings: LeaderboardEntry[];
}

export interface LeaderboardData {
  workoutTitle: string;
  scheduledFor: Date;
  exercises: LeaderboardExercise[];
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardData;
  message?: string;
}
