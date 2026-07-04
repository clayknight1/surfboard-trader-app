import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import {
  getPushPermissionStatus,
  openNotificationSettings,
  PushPermissionStatus,
  registerForPushNotificationsAsync,
  requestPushPermission,
} from './services/pushService';

const DISMISS_KEY = 'push_prompt_last_dismissed_at';
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function usePushPrompt() {
  const [permission, setPermission] =
    useState<PushPermissionStatus>('undetermined');
  const [lastDismissedAt, setLastDismissedAt] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const status = await getPushPermissionStatus();
    setPermission(status);
    const raw = await AsyncStorage.getItem(DISMISS_KEY);
    setLastDismissedAt(raw ? parseInt(raw, 10) : null);
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const pastCooldown =
    lastDismissedAt === null || Date.now() - lastDismissedAt > COOLDOWN_MS;

  const canPromptNow = permission !== 'granted' && pastCooldown;

  const markDismissed = useCallback(async () => {
    const now = Date.now();
    await AsyncStorage.setItem(DISMISS_KEY, now.toString());
    setLastDismissedAt(now);
  }, []);

  const requestAndRegister = useCallback(async () => {
    const status = await requestPushPermission();
    setPermission(status);
    if (status === 'granted') {
      await registerForPushNotificationsAsync();
    }
    return status;
  }, []);

  return {
    permission,
    canPromptNow,
    markDismissed,
    requestAndRegister,
    openSettings: openNotificationSettings,
    refresh,
  };
}
