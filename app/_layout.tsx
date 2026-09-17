import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold } from '@expo-google-fonts/work-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { BinZoneProvider } from '@/lib/binZone';
import { StoreProvider } from '@/lib/store';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_700Bold,
    Fraunces_600SemiBold,
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    Caveat_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <BinZoneProvider>
            <Stack screenOptions={{ contentStyle: { backgroundColor: colors.paper } }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ presentation: 'modal', title: 'Settings' }} />
              <Stack.Screen name="future-me" options={{ presentation: 'modal', title: 'Future Me' }} />
            </Stack>
          </BinZoneProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
