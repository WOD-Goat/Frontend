import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { apiClient } from "../api/client";
import { authService } from "../api/services/auth";
import { useGlobalState } from "../components/lib/global-state";
import { storage, useStorage } from "../components/lib/storage";
import { ToastProvider } from "../components/lib/toast/ToastProvider";
import "../config/firebase"; //
import { preloadImages } from "../utils/imagePreloader";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { get: getStorage } = useStorage();
  const globalState = useGlobalState();

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

  // Preload images when component mounts
  useEffect(() => {
    const loadImages = async () => {
      await preloadImages();
      setImagesLoaded(true);
    };
    loadImages();
  }, []);

  // Check authentication when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for auth service to initialize and load tokens
        await apiClient.waitForInitialization();

        // Check if tokens exist in storage
        const hasTokens = authService.isAuthenticated();

        if (!hasTokens) {
          console.log("🔐 Layout: No tokens found");
          setIsAuthenticated(false);
          setAuthChecked(true);
          return;
        }

        console.log("🔐 Layout: Tokens found, validating refresh token...");

        // Try to refresh the access token to validate refresh token
        try {
          const refreshed = await apiClient.refreshAccessToken();

          if (refreshed) {
            console.log(
              "✅ Layout: Refresh token valid, access token refreshed",
            );

            // Load user data from storage and set in global state
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
    };

    checkAuth();
  }, []);

  // Hide splash screen and navigate when everything is ready
  useEffect(() => {
    if ((loaded || error) && imagesLoaded && authChecked) {
      SplashScreen.hideAsync();

      // Navigate to appropriate screen
      if (isAuthenticated) {
        authService.getProfile().then(async (res) => {
          await Promise.all([storage.set("user", res.user)]);
          globalState.set("user", res.user);
        });
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [loaded, error, imagesLoaded, authChecked, isAuthenticated]);

  if ((!loaded && !error) || !imagesLoaded || !authChecked) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        </Stack>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
