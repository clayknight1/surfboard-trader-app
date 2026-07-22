import { Stack } from 'expo-router';
import { focusManager, QueryCache, QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { AuthProvider } from '../lib/auth';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PostHogProvider } from 'posthog-react-native';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { setupAndroidChannel } from '../lib/services/pushService';
import NotificationTapHandler from '../components/push/NotificationTapHandler';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: false,

  // Enable Logs
  enableLogs: false,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active');
    if (state === 'background') {
      supabase.realtime.disconnect();
    } else if (state === 'active') {
      supabase.realtime.connect();
    }
  });
  return () => subscription.remove();
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes — serve from cache without refetching
      refetchOnWindowFocus: false, // opt-in per-query where needed
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
  queryCache: new QueryCache({
    onError: (error) => Sentry.captureException(error),
  }),
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    setupAndroidChannel();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY!}
        options={{ host: 'https://us.i.posthog.com', disabled: __DEV__ }}
      >
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, buster: 'v10' }}
        >
          <SafeAreaProvider>
            <AuthProvider>
              <NotificationTapHandler />
              <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
          </SafeAreaProvider>
        </PersistQueryClientProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
});
