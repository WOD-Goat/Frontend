// Workout Types

export type TrackingType =
  | "weight_reps"
  | "reps"
  | "time"
  | "distance"
  | "pace"
  | "calories";

export interface StandardExercise {
  id: string;
  name: string;
  category: string;
  trackingType: TrackingType;
  trackResults?: boolean; // false = no result input / no PR (e.g. AMRAP, EMOM). Omitted means true.
  description: string;
  muscleGroups: string[];
  aliases?: string[];
}

export interface ExerciseData {
  exerciseId: string;
  name: string;
  instructions: string;
  trackingType: TrackingType;
}

export interface WODData {
  name: string; // WOD name (e.g., "Metcon", "Strength Work")
  rawText?: string | null; // Free-text description (when wodType === "raw")
  exercises: ExerciseData[]; // Exercises within this WOD (empty for raw WODs)
}

export interface ResultData {
  wodIndex: number; // links to wods array
  exerciseIndex: number; // links to exercises array within WOD
  reps: number | null;
  weight: number | null;
  timeInSeconds: number | null;
  distanceMeters: number | null;
  calories: number | null;
}

export interface AssignedWorkoutData {
  id?: string;
  title?: string | null;
  assignedBy: string; // userId of creator (self/friend)
  groupId: string | null; // optional if assigned to a group
  groupName?: string | null; // name of the group if this is a group workout
  source?: "personal" | "group"; // source of the workout
  assignedAt: Date;
  scheduledFor: Date; // day user is expected to do it
  completed: boolean;
  hasSubmitted?: boolean;
  completedAt: Date | null;
  notes: string | null;
  wodType?: "structured" | "raw";
  rawText?: string | null;
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
  nextCursor?: string | null;
  message?: string;
}

// Workout creation/update types
export interface CreateWorkoutData {
  groupId?: string | null;
  title?: string | null;
  scheduledFor: Date;
  notes?: string | null;
  wodType?: "structured" | "raw";
  rawText?: string | null;
  wods: WODData[];
}

export interface UpdateWorkoutData {
  groupId?: string | null;
  scheduledFor?: Date;
  completed?: boolean;
  completedAt?: Date | null;
  notes?: string | null;
  rawText?: string | null;
  wods?: WODData[];
  results?: ResultData[];
}
