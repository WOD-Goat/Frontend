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
   * Get this week's workouts for a group (Sat–Fri window)
   */
  getGroupWeekWorkouts: async (
    groupId: string,
    weekStart?: string,
  ): Promise<GroupWorkoutsResponse> => {
    const query = weekStart ? `?weekStart=${weekStart}` : "";
    const response = await apiClient.get<GroupWorkoutsResponse>(
      `${API_ENDPOINTS.GROUPS.GET_WEEK_WORKOUTS(groupId)}${query}`,
    );
    return response as unknown as GroupWorkoutsResponse;
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
   * Get past workouts history for a group (newest first)
   */
  getGroupWorkoutHistory: async (
    groupId: string,
    limit?: number,
    cursor?: string | null,
  ): Promise<GroupWorkoutsResponse> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", String(limit));
    if (cursor) params.append("cursor", cursor);
    const query = params.toString();
    const endpoint = query
      ? `${API_ENDPOINTS.GROUPS.GET_WORKOUT_HISTORY(groupId)}?${query}`
      : API_ENDPOINTS.GROUPS.GET_WORKOUT_HISTORY(groupId);
    const response = await apiClient.get<GroupWorkoutsResponse>(endpoint);
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
    comment?: string | null,
  ): Promise<ApiResponse> => {
    const body: Record<string, unknown> = { results };
    if (comment) body.comment = comment;
    const response = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.GROUPS.SUBMIT_WORKOUT(groupId, workoutId),
      body,
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
   * Get detailed stats for a group member (admin only)
   */
  getMemberDetail: async (groupId: string, userId: string): Promise<import("@/types").MemberDetailResponse> => {
    const response = await apiClient.get<import("@/types").MemberDetailResponse>(
      API_ENDPOINTS.GROUPS.GET_MEMBER_DETAIL(groupId, userId),
    );
    return response as unknown as import("@/types").MemberDetailResponse;
  },

  /**
   * Remove a member from a group (leave group or admin kick)
   */
  removeMember: async (groupId: string, userId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, userId),
    );
    return response as unknown as ApiResponse;
  },

  /**
   * Set a member's subscription due date (admin only)
   */
  setMemberSubscription: async (
    groupId: string,
    userId: string,
    data: { dueDate: string; suspended?: boolean },
  ): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.GROUPS.SET_MEMBER_SUBSCRIPTION(groupId, userId),
      data,
    );
    return response as unknown as ApiResponse;
  },

  /**
   * Get a member's subscription status (admin only)
   */
  getMemberSubscription: async (
    groupId: string,
    userId: string,
  ): Promise<{ success: boolean; data: { dueDate: string | null; suspended: boolean } | null }> => {
    const response = await apiClient.get(
      API_ENDPOINTS.GROUPS.GET_MEMBER_SUBSCRIPTION(groupId, userId),
    );
    return response as any;
  },

  /**
   * Get leaderboard for a group workout (coach only)
   */
  getLeaderboard: async (
    groupId: string,
    workoutId: string,
    params?: { limit?: number; startAfter?: string },
  ): Promise<LeaderboardResponse> => {
    let endpoint = API_ENDPOINTS.GROUPS.LEADERBOARD(groupId, workoutId);
    if (params) {
      const qs = new URLSearchParams();
      if (params.limit != null) qs.set("limit", String(params.limit));
      if (params.startAfter) qs.set("startAfter", params.startAfter);
      const queryString = qs.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    const response = await apiClient.get<LeaderboardResponse>(endpoint);
    return response as unknown as LeaderboardResponse;
  },
};
