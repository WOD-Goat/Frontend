import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  MemberProgramsResponse,
  ProgramLookupResponse,
  ProgramResponse,
  ProgramWorkoutResponse,
  ProgramWorkoutsResponse,
} from "@/types";
import type { ApiResponse } from "@/types/common";

export const programsService = {
  /**
   * Look up a program by join code without joining (used to preview the
   * program and prompt for a start date before the athlete commits).
   */
  lookupByCode: async (code: string): Promise<ProgramLookupResponse> => {
    const response = await apiClient.get<ProgramLookupResponse>(
      API_ENDPOINTS.PROGRAMS.LOOKUP_BY_CODE(code),
    );
    return response as unknown as ProgramLookupResponse;
  },

  /**
   * Join a program via join code with a chosen start date (defaults to today server-side)
   */
  joinProgram: async (code: string, startDate?: Date): Promise<ApiResponse> => {
    const body: Record<string, unknown> = { code };
    if (startDate) body.startDate = startDate.toISOString();
    const response = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.PROGRAMS.JOIN,
      body,
    );
    return response as unknown as ApiResponse;
  },

  /**
   * Programs the current user is enrolled in as an athlete
   */
  getMemberPrograms: async (): Promise<MemberProgramsResponse> => {
    const response = await apiClient.get<MemberProgramsResponse>(
      API_ENDPOINTS.PROGRAMS.GET_MEMBER_PROGRAMS,
    );
    return response as unknown as MemberProgramsResponse;
  },

  /**
   * Get a program's summary
   */
  getProgramById: async (id: string): Promise<ProgramResponse> => {
    const response = await apiClient.get<ProgramResponse>(
      API_ENDPOINTS.PROGRAMS.GET_BY_ID(id),
    );
    return response as unknown as ProgramResponse;
  },

  /**
   * Get all day-workouts for a program (full syllabus), with the caller's
   * computed currentDayNumber attached
   */
  getProgramWorkouts: async (id: string): Promise<ProgramWorkoutsResponse> => {
    const response = await apiClient.get<ProgramWorkoutsResponse>(
      API_ENDPOINTS.PROGRAMS.GET_WORKOUTS(id),
    );
    return response as unknown as ProgramWorkoutsResponse;
  },

  /**
   * Get a specific program day-workout
   */
  getProgramWorkout: async (
    id: string,
    workoutId: string,
  ): Promise<ProgramWorkoutResponse> => {
    const response = await apiClient.get<ProgramWorkoutResponse>(
      API_ENDPOINTS.PROGRAMS.GET_WORKOUT(id, workoutId),
    );
    return response as unknown as ProgramWorkoutResponse;
  },

  /**
   * Submit results for a program day-workout
   */
  submitProgramWorkout: async (
    id: string,
    workoutId: string,
    results: import("@/types").ResultData[],
    comment?: string | null,
  ): Promise<ApiResponse> => {
    const body: Record<string, unknown> = { results };
    if (comment) body.comment = comment;
    const response = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.PROGRAMS.SUBMIT_WORKOUT(id, workoutId),
      body,
    );
    return response as unknown as ApiResponse;
  },

  /**
   * Leave a program
   */
  leaveProgram: async (id: string, userId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      API_ENDPOINTS.PROGRAMS.LEAVE(id, userId),
    );
    return response as unknown as ApiResponse;
  },
};
