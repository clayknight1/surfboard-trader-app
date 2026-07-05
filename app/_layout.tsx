import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import { QueryCache, QueryClient } from '@tanstack/react-query';
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

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

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

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
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

  const router = useRouter();

  const lastResponse = Notifications.useLastNotificationResponse();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    setupAndroidChannel();
  }, []);

  useEffect(() => {
    if (!lastResponse) return;
    if (!navigationState?.key) return;
    const data = lastResponse.notification.request.content.data as {
      type?: string;
      threadId?: string;
      listingId?: string;
    };
    if (data?.type === 'message' && data?.threadId) {
      const path = data.listingId
        ? `/messages/${data.threadId}?listingId=${data.listingId}`
        : `/messages/${data.threadId}`;
      router.push(path);
    }
  }, [lastResponse, router, navigationState?.key]);

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
          persistOptions={{ persister, buster: 'v9' }}
        >
          <SafeAreaProvider>
            <AuthProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
          </SafeAreaProvider>
        </PersistQueryClientProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
});
