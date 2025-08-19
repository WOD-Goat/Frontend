
// User Types

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export interface User {
  id?: string;
  email: string;
  password: string;
  fullName: string;
  nickname: string;
  mobileNumber: string;
  gender: Gender;
  weight: number;
  age: number;
  height: number;
  createdAt?: string;
  updatedAt?: string;
  token?: string;
}

// Auth specific response type
export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: User;
}
