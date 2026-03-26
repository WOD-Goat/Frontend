import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const notificationsService = {
  registerToken: async (token: string): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_TOKEN, { token });
      console.log("🔔 NotificationsService: Push token registered");
    } catch (error) {
      console.error("🔔 NotificationsService: Failed to register push token:", error);
    }
  },

  deleteToken: async (): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_TOKEN);
      console.log("🔔 NotificationsService: Push token deleted");
    } catch (error) {
      console.error("🔔 NotificationsService: Failed to delete push token:", error);
    }
  },
};
