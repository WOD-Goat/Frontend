// Group Types
import type { ResultData, TrackingType, WODData } from "./workout";

export interface Group {
  id?: string;
  name: string;
  createdBy: string;
  memberIds?: string[];   // list endpoints (getMyGroups / getMemberGroups)
  members?: GroupMember[]; // detail endpoint (getGroupById)
  totalMembers?: number;
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
  adminParticipates?: boolean;
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
  comment?: string | null;
}

// Group Workout types
export interface GroupWorkout {
  id?: string;
  groupId: string;
  title?: string | null;
  scheduledFor: Date;
  notes?: string | null;
  publishedAt?: string | null;
  wodType?: "structured" | "raw";
  rawText?: string | null;
  wods: WODData[];
  createdBy: string;
  createdAt: Date;
  hasSubmitted?: boolean;
  userResult?: UserResult | null;
  submittedCount?: number;
  totalMembers?: number;
}

export interface GroupWorkoutResponse {
  success: boolean;
  data: GroupWorkout;
  message?: string;
}

export interface GroupWorkoutsResponse {
  success: boolean;
  data: GroupWorkout[];
  nextCursor?: string | null;
  message?: string;
}

export interface CreateGroupWorkoutData {
  title?: string | null;
  scheduledFor: Date;
  notes?: string | null;
  publishedAt?: string | null;
  wodType?: "structured" | "raw";
  rawText?: string | null;
  wods: WODData[];
}

// Member detail types
export interface MemberSubmission {
  workoutId: string;
  workoutTitle: string | null;
  scheduledFor: Date;
  submittedAt: Date;
  results: import("./workout").ResultData[];
  comment?: string | null;
  wods?: import("./workout").WODData[];
}

export interface MemberDetail {
  member: {
    uid: string;
    name: string | null;
    nickname: string | null;
    profilePictureUrl: string | null;
  };
  personalStats: {
    currentStreak: number;
    longestStreak: number;
  };
  groupStats: {
    totalWorkouts: number;
    completedWorkouts: number;
    completionRate: number;
  };
  subscription: {
    dueDate: string | null;
    suspended: boolean;
    notifiedAt: string | null;
  } | null;
  recentSubmissions: MemberSubmission[];
}

export interface MemberDetailResponse {
  success: boolean;
  data: MemberDetail;
  message?: string;
}

// Leaderboard types
export interface LeaderboardPreviousBest {
  weight?: number | null;
  reps?: number | null;
  estimated1RM?: number | null;
  timeInSeconds?: number | null;
  distanceMeters?: number | null;
  calories?: number | null;
  pace?: number | null;
  achievedAt: string;
}

export interface LeaderboardExerciseResult {
  wodIndex: number;
  wodName: string;
  exerciseIndex: number;
  exerciseName: string;
  trackingType: TrackingType;
  reps?: number | null;
  weight?: number | null;
  timeInSeconds?: number | null;
  distanceMeters?: number | null;
  calories?: number | null;
  isPR: boolean;
  previousBest?: LeaderboardPreviousBest | null;
}

export interface LeaderboardUserResult {
  userId: string;
  userName: string;
  profilePicture?: string | null;
  submittedAt: string;
  comment?: string | null;
  exercises: LeaderboardExerciseResult[];
}

export interface LeaderboardData {
  workoutId: string;
  workoutTitle: string;
  scheduledFor: string;
  nextCursor?: string | null;
  results: LeaderboardUserResult[];
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardData;
  message?: string;
}
