import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { GardenProvider } from '@/game/garden-provider';
import { preloadGardenArt } from '@/components/garden/sprites';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    GardenPixel: require('../../assets/fonts/PixelifySans.ttf'),
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void preloadGardenArt();
      // Runtime locking also works inside Expo Go, where app config alone may
      // not control the host's orientation. Portrait fallback is in the garden.
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    }
  }, []);

  if (!loaded && !error) return null;
  return (
    <GardenProvider>
      <StatusBar hidden />
      {Platform.OS === 'android' && <NavigationBar hidden />}
      <Stack screenOptions={{ headerShown: false, orientation: 'landscape', statusBarHidden: true,
        navigationBarHidden: true, autoHideHomeIndicator: true, contentStyle: { backgroundColor: '#80dfad' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="shop" options={{ animation: 'none', presentation: 'transparentModal', contentStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen name="settings" options={{ animation: 'none', presentation: 'transparentModal', contentStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen name="explore" options={{ headerShown: true, title: 'Explore' }} />
      </Stack>
    </GardenProvider>
  );
}
