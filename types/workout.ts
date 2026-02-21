// Workout Types

export type WorkoutType = "for_time" | "amrap" | "emom" | "strength" | "custom";

export type TrackingType =
  | "weight_reps"
  | "reps"
  | "time"
  | "distance"
  | "calories";

export interface ExerciseData {
  exerciseId: string;
  exerciseName: string;
  sets?: number;
  reps?: number | string; // Can be a number or "AMRAP"
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
  notes?: string;
  order?: number; // For ordering exercises in a workout
}

export interface ResultData {
  exerciseId: string;
  exerciseName: string;
  completedAt: Date;
  weight?: number;
  reps?: number;
  timeInSeconds?: number;
  distance?: number;
  calories?: number;
  notes?: string;
}

export interface AssignedWorkout {
  id?: string;
  assignedBy: string;
  groupId: string | null;
  title: string;
  type: WorkoutType;
  assignedAt: Date;
  scheduledFor: Date;
  completed: boolean;
  completedAt: Date | null;
  notes: string | null;
  exercises: ExerciseData[];
  results: ResultData[];
}

// Workout response types for API
export interface WorkoutResponse {
  success: boolean;
  data: AssignedWorkout;
  message?: string;
}

export interface WorkoutsResponse {
  success: boolean;
  data: AssignedWorkout[];
  message?: string;
}

// Workout creation/update types
export interface CreateWorkoutData {
  title: string;
  type: WorkoutType;
  scheduledFor: Date;
  groupId?: string | null;
  notes?: string | null;
  exercises: ExerciseData[];
}

export interface UpdateWorkoutData {
  title?: string;
  type?: WorkoutType;
  scheduledFor?: Date;
  notes?: string | null;
  exercises?: ExerciseData[];
  completed?: boolean;
  completedAt?: Date | null;
  results?: ResultData[];
}
