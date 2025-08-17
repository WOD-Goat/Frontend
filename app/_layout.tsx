import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // League Spartan fonts
    'LeagueSpartan-Thin': require('../assets/fonts/League_Spartan/static/LeagueSpartan-Thin.ttf'),
    'LeagueSpartan-ExtraLight': require('../assets/fonts/League_Spartan/static/LeagueSpartan-ExtraLight.ttf'),
    'LeagueSpartan-Light': require('../assets/fonts/League_Spartan/static/LeagueSpartan-Light.ttf'),
    'LeagueSpartan-Regular': require('../assets/fonts/League_Spartan/static/LeagueSpartan-Regular.ttf'),
    'LeagueSpartan-Medium': require('../assets/fonts/League_Spartan/static/LeagueSpartan-Medium.ttf'),
    'LeagueSpartan-SemiBold': require('../assets/fonts/League_Spartan/static/LeagueSpartan-SemiBold.ttf'),
    'LeagueSpartan-Bold': require('../assets/fonts/League_Spartan/static/LeagueSpartan-Bold.ttf'),
    'LeagueSpartan-ExtraBold': require('../assets/fonts/League_Spartan/static/LeagueSpartan-ExtraBold.ttf'),
    'LeagueSpartan-Black': require('../assets/fonts/League_Spartan/static/LeagueSpartan-Black.ttf'),
    
    // Poppins fonts
    'Poppins-Thin': require('../assets/fonts/Poppins (1)/Poppins-Thin.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins (1)/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins (1)/Poppins-Light.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins (1)/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins (1)/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins (1)/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins (1)/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins (1)/Poppins-ExtraBold.ttf'),
    'Poppins-Black': require('../assets/fonts/Poppins (1)/Poppins-Black.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
