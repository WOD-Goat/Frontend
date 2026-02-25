import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
    CreatePersonalRecordData,
    PersonalRecordResponse,
    PersonalRecordsResponse,
    UpdatePersonalRecordData
} from "@/types";

export const personalRecordsService = {
  /**
   * Get all personal records for the authenticated user
   */
  getAllPersonalRecords: async (): Promise<PersonalRecordsResponse> => {
    console.log("💪 PersonalRecordsService: Fetching all personal records");

    try {
      const response = await apiClient.get<PersonalRecordsResponse>(
        API_ENDPOINTS.PERSONAL_RECORDS.GET_ALL,
      );

      console.log("💪 PersonalRecordsService: Get all PRs response:", response);

      const prsResponse = response as unknown as PersonalRecordsResponse;

      return prsResponse;
    } catch (error) {
      console.error("💪 PersonalRecordsService: Get all PRs error:", error);
      throw error;
    }
  },

  /**
   * Get a specific personal record by ID
   */
  getPersonalRecordById: async (
    id: string,
  ): Promise<PersonalRecordResponse> => {
    console.log("💪 PersonalRecordsService: Fetching PR by ID:", id);

    try {
      const response = await apiClient.get<PersonalRecordResponse>(
        API_ENDPOINTS.PERSONAL_RECORDS.GET_BY_ID(id),
      );

      console.log(
        "💪 PersonalRecordsService: Get PR by ID response:",
        response,
      );

      const prResponse = response as unknown as PersonalRecordResponse;

      return prResponse;
    } catch (error) {
      console.error("💪 PersonalRecordsService: Get PR by ID error:", error);
      throw error;
    }
  },

  /**
   * Get personal records for a specific exercise
   */
  getPersonalRecordsByExercise: async (
    exerciseId: string,
  ): Promise<PersonalRecordsResponse> => {
    console.log(
      "💪 PersonalRecordsService: Fetching PRs for exercise:",
      exerciseId,
    );

    try {
      const response = await apiClient.get<PersonalRecordsResponse>(
        API_ENDPOINTS.PERSONAL_RECORDS.GET_BY_EXERCISE(exerciseId),
      );

      console.log(
        "💪 PersonalRecordsService: Get PRs by exercise response:",
        response,
      );

      const prsResponse = response as unknown as PersonalRecordsResponse;

      return prsResponse;
    } catch (error) {
      console.error(
        "💪 PersonalRecordsService: Get PRs by exercise error:",
        error,
      );
      throw error;
    }
  },

  /**
   * Create a new personal record
   */
  createPersonalRecord: async (
    prData: CreatePersonalRecordData,
  ): Promise<PersonalRecordResponse> => {
    console.log("💪 PersonalRecordsService: Creating PR with:", prData);

    try {
      const response = await apiClient.post<PersonalRecordResponse>(
        API_ENDPOINTS.PERSONAL_RECORDS.CREATE,
        prData,
      );

      console.log("💪 PersonalRecordsService: Create PR response:", response);

      const prResponse = response as unknown as PersonalRecordResponse;

      return prResponse;
    } catch (error) {
      console.error("💪 PersonalRecordsService: Create PR error:", error);
      throw error;
    }
  },

  /**
   * Update an existing personal record
   */
  updatePersonalRecord: async (
    id: string,
    prData: UpdatePersonalRecordData,
  ): Promise<PersonalRecordResponse> => {
    console.log("💪 PersonalRecordsService: Updating PR:", id, prData);

    try {
      const response = await apiClient.put<PersonalRecordResponse>(
        API_ENDPOINTS.PERSONAL_RECORDS.UPDATE(id),
        prData,
      );

      console.log("💪 PersonalRecordsService: Update PR response:", response);

      const prResponse = response as unknown as PersonalRecordResponse;

      return prResponse;
    } catch (error) {
      console.error("💪 PersonalRecordsService: Update PR error:", error);
      throw error;
    }
  },

  /**
   * Delete a personal record
   */
  deletePersonalRecord: async (id: string): Promise<PersonalRecordResponse> => {
    console.log("💪 PersonalRecordsService: Deleting PR:", id);

    try {
      const response = await apiClient.delete<PersonalRecordResponse>(
        API_ENDPOINTS.PERSONAL_RECORDS.DELETE(id),
      );

      console.log("💪 PersonalRecordsService: Delete PR response:", response);

      const prResponse = response as unknown as PersonalRecordResponse;

      return prResponse;
    } catch (error) {
      console.error("💪 PersonalRecordsService: Delete PR error:", error);
      throw error;
    }
  },
};
