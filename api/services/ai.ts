import type { ApiResponse } from "@/types/common";
import type { CreateWorkoutData } from "@/types";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export interface VoiceWorkoutRequest {
  audio: string; // base64-encoded audio
  mimeType: string; // e.g. "audio/m4a"
}

export interface VoiceWorkoutSuccessData {
  transcript: string;
  parsedWorkout: CreateWorkoutData;
}

export interface FreeFormWod {
  name: string;
  rawText: string;
}

export interface FreeFormWorkoutSuccessData {
  transcript: string;
  parsedWorkout: {
    scheduledFor: string;
    notes: string | null;
    wods: FreeFormWod[];
  };
}

export const aiService = {
  parseVoiceWorkout: (
    payload: VoiceWorkoutRequest,
  ): Promise<ApiResponse<VoiceWorkoutSuccessData>> => {
    return apiClient.post<VoiceWorkoutSuccessData>(
      API_ENDPOINTS.AI.PARSE_WORKOUT,
      payload,
    );
  },

  formatVoiceWorkout: (
    payload: VoiceWorkoutRequest,
  ): Promise<ApiResponse<FreeFormWorkoutSuccessData>> => {
    return apiClient.post<FreeFormWorkoutSuccessData>(
      API_ENDPOINTS.AI.FORMAT_WORKOUT,
      payload,
    );
  },
};
