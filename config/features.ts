import type { Plan } from "@/hooks/useRevenueCat";

export type { Plan };

export interface PlanFeatures {
  // Voice Workout limits
  /** Max voice workouts per calendar month. null = unlimited */
  voiceWorkoutMaxCountPerMonth: number | null;
  /** Max recording duration in seconds. null = unlimited */
  voiceWorkoutMaxDurationSeconds: number | null;

  // Group limits
  /** Max groups the user can join (groups they didn't create). null = unlimited */
  groupJoinMax: number | null;

  // Boolean feature flags
  /** Only CoachPro can create groups */
  createGroup: boolean;
  leaderboard: boolean;
  prShareSticker: boolean;
  customTimerIntervals: boolean;
}

export const FEATURE_CONFIG: Record<Plan, PlanFeatures> = {
  free: {
    voiceWorkoutMaxCountPerMonth: 5,
    voiceWorkoutMaxDurationSeconds: 45,
    groupJoinMax: 1,
    createGroup: false,
    leaderboard: false,
    prShareSticker: true,
    customTimerIntervals: true,
  },
  athlete: {
    voiceWorkoutMaxCountPerMonth: null,
    voiceWorkoutMaxDurationSeconds: 60,
    groupJoinMax: null,
    createGroup: false,
    leaderboard: false,
    prShareSticker: true,
    customTimerIntervals: true,
  },
  coach: {
    voiceWorkoutMaxCountPerMonth: null,
    voiceWorkoutMaxDurationSeconds: 90,
    groupJoinMax: null,
    createGroup: true,
    leaderboard: true,
    prShareSticker: true,
    customTimerIntervals: true,
  },
} as const;

export type BooleanFeatureKey =
  | "createGroup"
  | "leaderboard"
  | "prShareSticker"
  | "customTimerIntervals";

export const FEATURE_UPGRADE_HINTS: Record<
  BooleanFeatureKey,
  { requiredPlan: Plan; label: string; message: string }
> = {
  createGroup: {
    requiredPlan: "coach",
    label: "Coach",
    message: "Creating groups is a coach feature. Apply to become a coach from your profile.",
  },
  leaderboard: {
    requiredPlan: "coach",
    label: "Coach",
    message: "Leaderboards are a coach feature. Apply to become a coach from your profile.",
  },
  prShareSticker: {
    requiredPlan: "athlete",
    label: "Athlete Pro",
    message: "PR share stickers require Athlete Pro.",
  },
  customTimerIntervals: {
    requiredPlan: "athlete",
    label: "Athlete Pro",
    message: "Custom timer intervals require Athlete Pro.",
  },
};
