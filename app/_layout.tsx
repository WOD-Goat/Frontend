import notifee from "@notifee/react-native";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";

// Register the Android foreground service handler at module load time.
// The never-resolving Promise keeps the service alive for the duration of
// the timer notification; it ends automatically when the notification is cancelled.
if (Platform.OS === "android") {
  notifee.registerForegroundService(() => new Promise(() => {}));
}
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Purchases from "react-native-purchases";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { apiClient } from "../api/client";
import { appService } from "../api/services/app";
import { authService } from "../api/services/auth";
import { useGlobalState } from "../components/lib/global-state";
import { useZustandGlobalState } from "../components/lib/global-state/useGlobalState";
import { storage, useStorage } from "../components/lib/storage";
import { ToastProvider } from "../components/lib/toast/ToastProvider";
import NoInternetScreen from "../components/ui/NoInternetScreen";
import UpdateModal from "../components/ui/UpdateModal";
import "../config/firebase";
import { REVENUECAT_CONFIG } from "../config/revenuecat";
import { auth } from "../config/firebase";
import { useNotifications } from "../hooks/useNotifications";
import { preloadImages } from "../utils/imagePreloader";
import { isUpdateRequired } from "../utils/version";
import Constants from "expo-constants";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [networkChecked, setNetworkChecked] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { get: getStorage } = useStorage();
  const globalState = useGlobalState();
  const user = useZustandGlobalState((state) => state.user);
  const { registerForPushNotifications } = useNotifications();

  useEffect(() => {
    if (user?.uid) {
      registerForPushNotifications(user.uid);
    }
  }, [user?.uid, registerForPushNotifications]);

  const [loaded, error] = useFonts({
    // League Spartan fonts
    "LeagueSpartan-Thin": require("../assets/fonts/League_Spartan/static/LeagueSpartan-Thin.ttf"),
    "LeagueSpartan-ExtraLight": require("../assets/fonts/League_Spartan/static/LeagueSpartan-ExtraLight.ttf"),
    "LeagueSpartan-Light": require("../assets/fonts/League_Spartan/static/LeagueSpartan-Light.ttf"),
    "LeagueSpartan-Regular": require("../assets/fonts/League_Spartan/static/LeagueSpartan-Regular.ttf"),
    "LeagueSpartan-Medium": require("../assets/fonts/League_Spartan/static/LeagueSpartan-Medium.ttf"),
    "LeagueSpartan-SemiBold": require("../assets/fonts/League_Spartan/static/LeagueSpartan-SemiBold.ttf"),
    "LeagueSpartan-Bold": require("../assets/fonts/League_Spartan/static/LeagueSpartan-Bold.ttf"),
    "LeagueSpartan-ExtraBold": require("../assets/fonts/League_Spartan/static/LeagueSpartan-ExtraBold.ttf"),
    "LeagueSpartan-Black": require("../assets/fonts/League_Spartan/static/LeagueSpartan-Black.ttf"),

    // Poppins fonts
    "Poppins-Thin": require("../assets/fonts/Poppins (1)/Poppins-Thin.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins (1)/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins (1)/Poppins-Light.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins (1)/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins (1)/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins (1)/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins (1)/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins (1)/Poppins-ExtraBold.ttf"),
    "Poppins-Black": require("../assets/fonts/Poppins (1)/Poppins-Black.ttf"),
  });

  // Configure RevenueCat as early as possible
  useEffect(() => {
    try {
      Purchases.configure({ apiKey: REVENUECAT_CONFIG.apiKey });
    } catch (error) {
      console.error("❌ RevenueCat: Failed to configure SDK", error);
    }
  }, []);

  // Check if a store update is required
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const minimumVersion = await appService.getMinimumVersion();
        const currentVersion = Constants.expoConfig?.version ?? "0.0.0";
        if (isUpdateRequired(currentVersion, minimumVersion)) {
          setShowUpdateModal(true);
        }
      } catch {
        // Silently ignore — never block the user due to a network failure
      }
    };
    checkVersion();
  }, []);

  // Preload images when component mounts
  useEffect(() => {
    const loadImages = async () => {
      await preloadImages();
      setImagesLoaded(true);
    };
    loadImages();
  }, []);

  // Check network + authentication on mount and on retry
  const initializeApp = async () => {
    try {
      const netState = await NetInfo.fetch();
      const online = !!netState.isConnected && netState.isInternetReachable !== false;
      setIsOnline(online);
      setNetworkChecked(true);

      if (!online) {
        setAuthChecked(true);
        return;
      }

      try {
        await apiClient.waitForInitialization();
        const hasTokens = authService.isAuthenticated();

        if (!hasTokens) {
          console.log("🔐 Layout: No tokens found");
          setIsAuthenticated(false);
          setAuthChecked(true);
          return;
        }

        console.log("🔐 Layout: Tokens found, validating refresh token...");

        try {
          const refreshed = await apiClient.refreshAccessToken();

          if (refreshed) {
            console.log("✅ Layout: Refresh token valid, access token refreshed");

            const firebaseUser = await new Promise<any>((resolve) => {
              const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
              });
            });
            if (firebaseUser && !firebaseUser.emailVerified) {
              console.log("⚠️ Layout: Email not verified, logging out");
              await apiClient.clearTokens();
              setIsAuthenticated(false);
              setAuthChecked(true);
              return;
            }

            const userData = await getStorage("user");
            if (userData) {
              console.log("👤 Layout: User data loaded from storage");
              globalState.set("user", userData);
            }

            setIsAuthenticated(true);
          } else {
            console.log("⚠️ Layout: Refresh token invalid, clearing storage");
            await apiClient.clearTokens();
            setIsAuthenticated(false);
          }
        } catch {
          console.log("⚠️ Layout: Session expired, please log in again");
          await apiClient.clearTokens();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ Layout auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    } catch (err) {
      console.error("❌ Layout initialization error:", err);
      setIsOnline(false);
      setNetworkChecked(true);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setNetworkChecked(false);
    setAuthChecked(false);
    setIsAuthenticated(false);
    await initializeApp();
    setIsRetrying(false);
  };

  // Hide splash screen and navigate when everything is ready
  useEffect(() => {
    if ((loaded || error) && imagesLoaded && authChecked && networkChecked) {
      SplashScreen.hideAsync();

      if (!isOnline) return;

      if (isAuthenticated) {
        authService.getProfile().then(async (res) => {
          await Promise.all([storage.set("user", res.user)]);
          globalState.set("user", res.user);

          if (res.user?.uid) {
            try {
              await Purchases.logIn(String(res.user.uid));
            } catch (rcErr) {
              console.warn("⚠️ RevenueCat: logIn failed", rcErr);
            }
          }
        });
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [loaded, error, imagesLoaded, authChecked, networkChecked, isAuthenticated]);

  if ((!loaded && !error) || !imagesLoaded || !authChecked || !networkChecked) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StatusBar style="light" />
        <UpdateModal visible={showUpdateModal} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="paywall"
            options={{ presentation: "fullScreenModal" }}
          />
          <Stack.Screen name="timer" options={{ headerShown: false }} />
        </Stack>
        {!isOnline && (
          <NoInternetScreen onRetry={handleRetry} loading={isRetrying} />
        )}
      </ToastProvider>
    </SafeAreaProvider>
  );
}
