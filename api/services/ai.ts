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

export const aiService = {
  parseVoiceWorkout: (
    payload: VoiceWorkoutRequest,
  ): Promise<ApiResponse<VoiceWorkoutSuccessData>> => {
    return apiClient.post<VoiceWorkoutSuccessData>(
      API_ENDPOINTS.AI.PARSE_WORKOUT,
      payload,
    );
  },
};
