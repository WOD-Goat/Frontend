// User Types

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export interface User {
  uid: string | null;
  name: string;
  nickname: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: string;
  height: number;
  weight: number;
  profilePictureUrl: string;
  statsSummary: {
    totalWorkouts: number;
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: Date | null;
    latestPR: {
      exerciseId: string | null;
      exerciseName: string | null;
      estimated1RM: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserData {
  email: string;
  password: string;
  fullName: string;
  nickname: string;
  mobileNumber: string;
  gender: Gender;
  weight: number;
  age: number;
  height: number;
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

export interface AuthErrorResponse {
  success: false;
  message: string;
}
