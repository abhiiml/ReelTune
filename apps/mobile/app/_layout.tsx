import '../global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import * as Network from 'expo-network';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ToastManager } from '../components/ui/ToastManager';
import { OfflineBanner } from '../components/ui/OfflineBanner';

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      useToastStore.getState().showToast(error.message, 'error');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      useToastStore.getState().showToast(error.message, 'error');
    },
  }),
});

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const { session, initialize, isLoading: isAuthLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOffline(state.isConnected === false);
    };
    checkNetwork();
    const interval = setInterval(checkNetwork, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await SecureStore.getItemAsync('onboardingComplete');
        setOnboardingComplete(value === 'true');
      } catch {
        setOnboardingComplete(false);
      }
    };
    checkOnboarding();
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (isAuthLoading || !fontsLoaded || onboardingComplete === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inOnboarding = segments[0] === ('onboarding' as any);

    if (session && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    } else if (!session) {
      if (!onboardingComplete && !inOnboarding) {
        router.replace('/onboarding' as never);
      } else if (onboardingComplete && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [session, isAuthLoading, segments, fontsLoaded, router, onboardingComplete]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // We might still be checking auth state, we can return null to avoid flash
  if (isAuthLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
        <StatusBar style="light" />
        {isOffline && <OfflineBanner />}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <ToastManager />
      </View>
    </QueryClientProvider>
  );
}

export default RootLayout;
