import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
    CreateWorkoutData,
    WorkoutResponse,
    WorkoutsResponse,
} from "@/types";

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
   * Get all workouts for the authenticated user
   * @param limit - Optional limit on number of workouts to return
   */
  getAllWorkouts: async (limit?: number): Promise<WorkoutsResponse> => {
    console.log("🏋️ WorkoutsService: Fetching all workouts", { limit });

    try {
      const endpoint = limit
        ? `${API_ENDPOINTS.WORKOUTS.GET_ALL}?limit=${limit}`
        : API_ENDPOINTS.WORKOUTS.GET_ALL;

      const response = await apiClient.get<WorkoutsResponse>(endpoint);

      console.log("🏋️ WorkoutsService: Get all workouts response:", response);

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
        API_ENDPOINTS.WORKOUTS.GET_BY_ID(workoutId)
      );

      console.log("🏋️ WorkoutsService: Get workout by ID response:", response);

      const workoutResponse = response as unknown as WorkoutResponse;

      return workoutResponse;
    } catch (error) {
      console.error("🏋️ WorkoutsService: Get workout by ID error:", error);
      throw error;
    }
  },
};
