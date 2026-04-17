// User Types

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export type UserType = "athlete" | "coach";
export type CoachApplicationStatus = "none" | "pending" | "approved" | "rejected";
export type CoachStatus = "active" | "suspended";

export interface User {
  uid: string | null;
  name: string;
  nickname: string;
  email: string;
  profilePictureUrl: string;
  userType: UserType;
  coachStatus?: CoachStatus | null;
  coachApplication?: {
    status: CoachApplicationStatus;
    phoneNumber?: string;
    avgAthletesCount?: number;
    currentGym?: string;
    rejectionReason?: string;
  };
  coachSubscription?: {
    expiresAt?: string;
  };
  statsSummary: {
    completedWorkouts: number;
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: Date | null;
    latestPR: {
      exerciseId: string | null;
      exerciseName: string | null;
      value: number;
    };
    totalPRs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserData {
  name: string;
  nickname: string;
  email: string;
  password: string;
  profilePictureUrl: string;
  phoneNumber?: string;
  avgAthletesCount?: number;
  currentGym?: string;
}

export interface CoachApplicationData {
  phoneNumber: string;
  avgAthletesCount: number;
  currentGym: string;
}

// Signup form data - used during the signup flow (uses age instead of birthYear for better UX)
export interface SignupFormData extends Omit<RegisterUserData, "birthYear"> {
  age: number;
}

// Auth specific response types
export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface AuthErrorResponse {
  success: false;
  message: string;
}
