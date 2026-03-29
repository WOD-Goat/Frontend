import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const appService = {
  getMinimumVersion: async (): Promise<string> => {
    const res = await apiClient.get<{ minimumVersion: string }>(
      API_ENDPOINTS.APP.VERSION,
    );
    return res.minimumVersion;
  },
};
