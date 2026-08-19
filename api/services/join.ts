import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { ResolveJoinCodeResponse } from "@/types";

export const joinService = {
  /**
   * Resolve a join code shared by a coach — tries Group codes first (joins
   * immediately), then falls back to Program codes (preview only, athlete
   * still picks a start date before calling programsService.joinProgram)
   */
  resolveCode: async (code: string): Promise<ResolveJoinCodeResponse> => {
    const response = await apiClient.post<ResolveJoinCodeResponse>(
      API_ENDPOINTS.JOIN.RESOLVE_CODE,
      { code },
    );
    return response as unknown as ResolveJoinCodeResponse;
  },
};
