import { useEffect, useRef } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../../lib/auth';

export default function NotificationTapHandler() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const lastResponse = Notifications.useLastNotificationResponse();
  const { loading } = useAuth();
  const handledResponseIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!lastResponse) {
      return;
    }
    if (!navigationState?.key) {
      return;
    }
    const notificationId = lastResponse.notification.request.identifier;
    if (handledResponseIdRef.current === notificationId) {
      return;
    }
    handledResponseIdRef.current = notificationId;

    const data = lastResponse.notification.request.content.data as {
      type?: string;
      threadId?: string;
      listingId?: string;
    };
    if (data?.type === 'message' && data?.threadId) {
      const path = data.listingId
        ? `/messages/${data.threadId}?listingId=${data.listingId}`
        : `/messages/${data.threadId}`;
      const timeoutId = setTimeout(() => {
        router.push(path);
      }, 200);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [lastResponse, router, navigationState?.key, loading]);

  return null;
}
