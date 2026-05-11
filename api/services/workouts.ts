import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  CreateWorkoutData,
  ResultData,
  UpdateWorkoutData,
  WorkoutResponse,
  WorkoutsResponse,
} from "@/types";
import type { ApiResponse } from "@/types/common";

export const workoutsService = {
  /**
   * Create a new workout
   */
  createWorkout: async (
    workoutData: CreateWorkoutData,
  ): Promise<WorkoutResponse> => {
    console.log("🏋️ WorkoutsService: Creating workout with:", workoutData);

    try {
      const response = await apiClient.post<WorkoutResponse>(
        API_ENDPOINTS.WORKOUTS.CREATE,
        workoutData,
      );

      console.log("🏋️ WorkoutsService: Create workout response:", response);

      const workoutResponse = response as unknown as WorkoutResponse;

      return workoutResponse;
    } catch (error) {
      console.error("🏋️ WorkoutsService: Create workout error:", error);
      throw error;
    }
  },

  /**
   * Get past workouts history (newest first)
   */
  getWorkoutHistory: async (
    limit?: number,
    cursor?: string | null,
  ): Promise<WorkoutsResponse> => {
    try {
      const params = new URLSearchParams();
      if (limit !== undefined) params.append("limit", String(limit));
      if (cursor) params.append("cursor", cursor);
      const query = params.toString();
      const endpoint = query
        ? `${API_ENDPOINTS.WORKOUTS.GET_HISTORY}?${query}`
        : API_ENDPOINTS.WORKOUTS.GET_HISTORY;

      const response = await apiClient.get<WorkoutsResponse>(endpoint);
      return response as unknown as WorkoutsResponse;
    } catch (error) {
      console.error("🏋️ WorkoutsService: Get workout history error:", error);
      throw error;
    }
  },

  /**
   * Get all workouts for the authenticated user
   * @param limit - Number of workouts to return per page
   * @param cursor - ISO-date cursor from previous response for pagination
   */
  getAllWorkouts: async (
    limit?: number,
    cursor?: string | null,
  ): Promise<WorkoutsResponse> => {
    try {
      const params = new URLSearchParams();
      if (limit !== undefined) params.append("limit", String(limit));
      if (cursor) params.append("cursor", cursor);
      const query = params.toString();
      const endpoint = query
        ? `${API_ENDPOINTS.WORKOUTS.GET_ALL}?${query}`
        : API_ENDPOINTS.WORKOUTS.GET_ALL;

      const response = await apiClient.get<WorkoutsResponse>(endpoint);

      const workoutsResponse = response as unknown as WorkoutsResponse;

      return workoutsResponse;
    } catch (error) {
      console.error("🏋️ WorkoutsService: Get all workouts error:", error);
      throw error;
    }
  },

  /**
   * Get a specific workout by ID
   * @param workoutId - The ID of the workout to fetch
   */
  getWorkoutById: async (workoutId: string): Promise<WorkoutResponse> => {
    console.log("🏋️ WorkoutsService: Fetching workout by ID", { workoutId });

    try {
      const response = await apiClient.get<WorkoutResponse>(
        API_ENDPOINTS.WORKOUTS.GET_BY_ID(workoutId),
      );

      console.log("🏋️ WorkoutsService: Get workout by ID response:", response);

      const workoutResponse = response as unknown as WorkoutResponse;

      return workoutResponse;
    } catch (error) {
      console.error("🏋️ WorkoutsService: Get workout by ID error:", error);
      throw error;
    }
  },

  /**
   * Mark a workout as completed
   * @param workoutId - The ID of the workout to complete
   * @param results - Array of exercise results
   */
  completeWorkout: async (
    workoutId: string,
    results: ResultData[],
    comment?: string | null,
  ): Promise<ApiResponse> => {
    console.log("🏋️ WorkoutsService: Completing workout", {
      workoutId,
      results,
    });

    try {
      const body: Record<string, unknown> = { results };
      if (comment) body.comment = comment;
      const response = await apiClient.post<ApiResponse>(
        API_ENDPOINTS.WORKOUTS.MARK_AS_COMPLETED(workoutId),
        body,
      );

      console.log("🏋️ WorkoutsService: Complete workout response:", response);

      return response as unknown as ApiResponse;
    } catch (error) {
      console.error("🏋️ WorkoutsService: Complete workout error:", error);
      throw error;
    }
  },

  /**
   * Update a workout
   * @param workoutId - The ID of the workout to update
   * @param updateData - Data to update
   */
  updateWorkout: async (
    workoutId: string,
    updateData: UpdateWorkoutData,
  ): Promise<ApiResponse> => {
    console.log("🏋️ WorkoutsService: Updating workout", {
      workoutId,
      updateData,
    });

    try {
      const response = await apiClient.put<ApiResponse>(
        API_ENDPOINTS.WORKOUTS.UPDATE(workoutId),
        updateData,
      );

      console.log("🏋️ WorkoutsService: Update workout response:", response);

      return response as unknown as ApiResponse;
    } catch (error) {
      console.error("🏋️ WorkoutsService: Update workout error:", error);
      throw error;
    }
  },

  /**
   * Delete a workout
   * @param workoutId - The ID of the workout to delete
   */
  deleteWorkout: async (workoutId: string): Promise<ApiResponse> => {
    console.log("🏋️ WorkoutsService: Deleting workout", { workoutId });

    try {
      const response = await apiClient.delete<ApiResponse>(
        API_ENDPOINTS.WORKOUTS.DELETE(workoutId),
      );

      console.log("🏋️ WorkoutsService: Delete workout response:", response);

      return response as unknown as ApiResponse;
    } catch (error) {
      console.error("🏋️ WorkoutsService: Delete workout error:", error);
      throw error;
    }
  },
};
