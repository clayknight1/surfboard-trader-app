import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Linking, Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { supabase } from '../supabase';

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PushPermissionStatus;
}

export async function requestPushPermission(): Promise<PushPermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status as PushPermissionStatus;
}

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
  if (!Device.isDevice) return null;

  const permission = await getPushPermissionStatus();
  if (permission !== 'granted') return null;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      Sentry.captureException(new Error('EAS projectId missing from config'), {
        extra: { context: 'register_push_token' },
      });
      return null;
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenResult.data;

    const { error } = await supabase.rpc('register_push_token', {
      p_token: token,
      p_platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });

    if (error) {
      Sentry.captureException(error, {
        extra: { context: 'register_push_token_rpc' },
      });
      return null;
    }

    return token;
  } catch (err) {
    Sentry.captureException(err, {
      extra: { context: 'get_expo_push_token' },
    });
    return null;
  }
}

export async function unregisterPushTokenAsync(token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('token', token);

  if (error) {
    Sentry.captureException(error, {
      extra: { context: 'unregister_push_token' },
    });
  }
}

export async function openNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (err) {
    Sentry.captureException(err, {
      extra: { context: 'open_notification_settings' },
    });
        Alert.alert(
      'Settings did not open',
      'Please open the Settings app manually and go to Surfboard Trader to change permissions.'
    );
  }
}

export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}
