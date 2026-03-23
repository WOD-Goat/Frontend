import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useRef } from "react";
import { Platform } from "react-native";
import { notificationsService } from "@/api/services/notifications";

const PROJECT_ID = "fa719d32-832a-4738-987a-4744b1759dbe";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const registeredForUserId = useRef<string | null>(null);

  const registerForPushNotifications = useCallback(async (userId: string) => {
    if (registeredForUserId.current === userId) return;

    if (!Device.isDevice) {
      console.log("🔔 Push notifications only work on physical devices");
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("🔔 Push notification permission denied");
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    await notificationsService.registerToken(tokenData.data);
    registeredForUserId.current = userId;
  }, []);

  return { registerForPushNotifications };
};
