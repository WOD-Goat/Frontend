// Workout Types

export type TrackingType =
  | "weight_reps"
  | "reps"
  | "time_distance"
  | "calories";

export interface ExerciseData {
  name: string;
  description: string; // instructions, weights, reps, timing, etc.
  trackingType: TrackingType;
}

export interface WODData {
  name: string; // WOD name (e.g., "Metcon", "Strength Work")
  exercises: ExerciseData[]; // Exercises within this WOD
}

export interface ResultData {
  wodIndex: number; // links to wods array
  exerciseIndex: number; // links to exercises array within WOD
  reps: number | null;
  weight: number | null;
  timeInSeconds: number | null;
  distanceMeters: number | null;
}

export interface AssignedWorkoutData {
  id?: string;
  assignedBy: string; // userId of creator (self/friend)
  groupId: string | null; // optional if assigned to a group
  assignedAt: Date;
  scheduledFor: Date; // day user is expected to do it
  completed: boolean;
  completedAt: Date | null;
  notes: string | null;
  wods: WODData[]; // Today's session contains multiple WODs
  results: ResultData[];
}

// Workout response types for API
export interface WorkoutResponse {
  success: boolean;
  data: AssignedWorkoutData;
  message?: string;
}

export interface WorkoutsResponse {
  success: boolean;
  data: AssignedWorkoutData[];
  message?: string;
}

// Workout creation/update types
export interface CreateWorkoutData {
  groupId?: string | null;
  scheduledFor: Date;
  notes?: string | null;
  wods: WODData[];
}

export interface UpdateWorkoutData {
  groupId?: string | null;
  scheduledFor?: Date;
  completed?: boolean;
  completedAt?: Date | null;
  notes?: string | null;
  wods?: WODData[];
  results?: ResultData[];
}
