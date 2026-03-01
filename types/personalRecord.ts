// New PR type for getAllPrs response
export interface NewPersonalRecord {
  actualPR: number;
  date: {
    _nanoseconds: number;
    _seconds: number;
  };
  exerciseName: string;
  improvement: number | null;
}
// Personal Record Types

export type PRTrackingType =
  | "weight_reps"
  | "reps"
  | "time"
  | "distance"
  | "pace"
  | "calories";

export interface PersonalRecord {
  id?: string;
  userId?: string; // Added for completeness
  exerciseId: string;
  exerciseName: string;
  trackingType: PRTrackingType;
  bestWeight: number | null;
  bestReps: number | null;
  bestEstimated1RM: number | null;
  bestTimeInSeconds: number | null;
  bestDistanceMeters: number | null;
  achievedAt: Date;
  lastUpdatedAt: Date;
}

// Personal Record response types for API
export interface PersonalRecordResponse {
  success: boolean;
  data: PersonalRecord;
  message?: string;
}

export interface PersonalRecordsResponse {
  success: boolean;
  data: PersonalRecord[];
  message?: string;
}

// Personal Record creation/update types
export interface CreatePersonalRecordData {
  exerciseId: string;
  exerciseName: string;
  trackingType: PRTrackingType;
  bestWeight?: number | null;
  bestReps?: number | null;
  bestEstimated1RM?: number | null;
  bestTimeInSeconds?: number | null;
  bestDistanceMeters?: number | null;
  bestCalories?: number | null;
}

export interface UpdatePersonalRecordData {
  bestWeight?: number | null;
  bestReps?: number | null;
  bestEstimated1RM?: number | null;
  bestTimeInSeconds?: number | null;
  bestDistanceMeters?: number | null;
}

// Helper types for displaying PRs
export interface PRSummary {
  exerciseName: string;
  value: string; // Formatted display value (e.g., "225 lbs x 5", "3:45", "100 reps")
  achievedAt: Date;
  trackingType: PRTrackingType;
}
