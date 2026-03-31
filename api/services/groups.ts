import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  CreateGroupData,
  CreateGroupWorkoutData,
  GroupMembersResponse,
  GroupResponse,
  GroupsResponse,
  GroupWorkoutResponse,
  GroupWorkoutsResponse,
  LeaderboardResponse,
} from "@/types";
import type { ApiResponse } from "@/types/common";

export const groupsService = {
  /**
   * Create a new group
   */
  createGroup: async (data: CreateGroupData): Promise<GroupResponse> => {
    const response = await apiClient.post<GroupResponse>(
      API_ENDPOINTS.GROUPS.CREATE,
      data,
    );
    return response as unknown as GroupResponse;
  },

  /**
   * Get groups created by the current user
   */
  getMyGroups: async (): Promise<GroupsResponse> => {
    const response = await apiClient.get<GroupsResponse>(
      API_ENDPOINTS.GROUPS.GET_MY_GROUPS,
    );
    return response as unknown as GroupsResponse;
  },

  /**
   * Get groups the current user is a member of (but didn't create)
   */
  getMemberGroups: async (): Promise<GroupsResponse> => {
    const response = await apiClient.get<GroupsResponse>(
      API_ENDPOINTS.GROUPS.GET_MEMBER_GROUPS,
    );
    return response as unknown as GroupsResponse;
  },

  /**
   * Get a specific group with member details
   */
  getGroupById: async (groupId: string): Promise<GroupMembersResponse> => {
    const response = await apiClient.get<GroupMembersResponse>(
      API_ENDPOINTS.GROUPS.GET_BY_ID(groupId),
    );
    return response as unknown as GroupMembersResponse;
  },

  /**
   * Join a group via join code
   */
  joinGroup: async (joinCode: string): Promise<GroupResponse> => {
    const response = await apiClient.post<GroupResponse>(
      API_ENDPOINTS.GROUPS.JOIN,
      { joinCode },
    );
    return response as unknown as GroupResponse;
  },

  /**
   * Regenerate join code (admin only)
   */
  regenerateCode: async (groupId: string): Promise<GroupResponse> => {
    const response = await apiClient.post<GroupResponse>(
      API_ENDPOINTS.GROUPS.GENERATE_CODE(groupId),
    );
    return response as unknown as GroupResponse;
  },

  /**
   * Get all workouts for a group
   */
  getGroupWorkouts: async (groupId: string): Promise<GroupWorkoutsResponse> => {
    const response = await apiClient.get<GroupWorkoutsResponse>(
      API_ENDPOINTS.GROUPS.GET_WORKOUTS(groupId),
    );
    return response as unknown as GroupWorkoutsResponse;
  },

  /**
   * Create a group workout (admin only)
   */
  createGroupWorkout: async (
    groupId: string,
    data: CreateGroupWorkoutData,
  ): Promise<GroupWorkoutResponse> => {
    const response = await apiClient.post<GroupWorkoutResponse>(
      API_ENDPOINTS.GROUPS.CREATE_WORKOUT(groupId),
      data,
    );
    return response as unknown as GroupWorkoutResponse;
  },

  /**
   * Get a specific group workout
   */
  getGroupWorkout: async (
    groupId: string,
    workoutId: string,
  ): Promise<GroupWorkoutResponse> => {
    const response = await apiClient.get<GroupWorkoutResponse>(
      API_ENDPOINTS.GROUPS.GET_WORKOUT(groupId, workoutId),
    );
    return response as unknown as GroupWorkoutResponse;
  },

  /**
   * Submit results for a group workout
   */
  submitGroupWorkout: async (
    groupId: string,
    workoutId: string,
    results: import("@/types").ResultData[],
  ): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.GROUPS.SUBMIT_WORKOUT(groupId, workoutId),
      { results },
    );
    return response as unknown as ApiResponse;
  },

  /**
   * Update a group workout (admin only)
   */
  updateGroupWorkout: async (
    groupId: string,
    workoutId: string,
    data: Partial<import("@/types").CreateGroupWorkoutData>,
  ): Promise<GroupWorkoutResponse> => {
    const response = await apiClient.put<GroupWorkoutResponse>(
      API_ENDPOINTS.GROUPS.UPDATE_WORKOUT(groupId, workoutId),
      data,
    );
    return response as unknown as GroupWorkoutResponse;
  },

  /**
   * Delete a group workout (admin only)
   */
  deleteGroupWorkout: async (
    groupId: string,
    workoutId: string,
  ): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      API_ENDPOINTS.GROUPS.DELETE_WORKOUT(groupId, workoutId),
    );
    return response as unknown as ApiResponse;
  },

  /**
   * Get leaderboard for a group workout
   */
  getLeaderboard: async (
    groupId: string,
    workoutId: string,
  ): Promise<LeaderboardResponse> => {
    const response = await apiClient.get<LeaderboardResponse>(
      API_ENDPOINTS.GROUPS.LEADERBOARD(groupId, workoutId),
    );
    return response as unknown as LeaderboardResponse;
  },
};
