import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../lib/auth';
import {
  updateUserProfile,
  uploadAvatar,
} from '../../lib/services/userService';
import { processPhoto } from '../../lib/utils';
import Screen from '../../components/ui/Screen';
import Avatar from '../../components/ui/Avatar';
import AuthInput from '../../components/ui/AuthInput';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePushPrompt } from '../../lib/usePushPrompt';
import { PushPermissionStatus } from '../../lib/services/pushService';

export default function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { permission, requestAndRegister, markDismissed, openSettings } =
    usePushPrompt();

  const notificationStatusLabel: Record<PushPermissionStatus, string> = {
    granted: 'On',
    denied: 'Off',
    undetermined: 'Enable',
  };

  async function handleNotificationTap() {
    if (permission === 'undetermined') {
      const status = await requestAndRegister();
      if (status !== 'granted') await markDismissed();
    } else {
      await openSettings();
    }
  }

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('No profile to update');

      let avatarUrl = profile.avatar_url;
      if (avatarUri) {
        avatarUrl = await uploadAvatar(profile.id, avatarUri);
      }

      await updateUserProfile(profile.id, {
        full_name: fullName.trim(),
        avatar_url: avatarUrl ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      refreshProfile();
      router.back();
    },
    onError: (err) => {
      Sentry.captureException(err);
      Alert.alert(
        "Couldn't save profile",
        'Check your connection and try again.',
      );
    },
  });

  async function pickAvatar() {
    Alert.alert('Change Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          try {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(
                'Permission required',
                'Please allow camera access in Settings.',
              );
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 1,
            });
            if (!result.canceled) {
              const { uri } = result.assets[0];
              const processed = await processPhoto(uri, 400);
              setAvatarUri(processed);
            }
          } catch (err) {
            Sentry.captureException(err);
            Alert.alert("Couldn't take photo", 'Try again in a moment.');
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          try {
            const permission =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(
                'Permission required',
                'Please allow access to your photo library in Settings.',
              );
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsMultipleSelection: false,
              quality: 1,
            });
            if (!result.canceled) {
              const { uri } = result.assets[0];
              const processed = await processPhoto(uri, 400);
              setAvatarUri(processed);
            }
          } catch (err) {
            Sentry.captureException(err);
            Alert.alert("Couldn't select photo", 'Try again in a moment.');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleSave() {
    if (!profile?.id) return;
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    saveProfileMutation.mutate();
  }

  return (
    <Screen>
      <ScreenHeader
        title='Edit Profile'
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity
            onPress={handleSave}
            disabled={saveProfileMutation.isPending}
          >
            {saveProfileMutation.isPending ? (
              <ActivityIndicator size='small' color={Colors.accent} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={pickAvatar}
            style={styles.avatarWrapper}
            accessibilityLabel='Change profile photo'
          >
            <Avatar
              avatarUrl={avatarUri ?? profile?.avatar_url ?? null}
              fullName={profile?.full_name ?? null}
              size={80}
            />
            <View style={styles.avatarEditBadge}>
              <Ionicons name='camera' size={14} color={Colors.backgroundCard} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <AuthInput
            label='Full Name'
            value={fullName}
            onChangeText={setFullName}
            placeholder='Your name'
            autoCapitalize='words'
            textContentType='name'
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleNotificationTap}
            accessibilityLabel='Notification settings'
          >
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name='notifications-outline'
                size={22}
                color={Colors.textPrimary}
              />
              <Text style={styles.settingsRowLabel}>Notifications</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={styles.settingsRowValue}>
                {notificationStatusLabel[permission]}
              </Text>
              <Ionicons
                name='chevron-forward'
                size={16}
                color={Colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    ...Typography.body,
    color: Colors.accent,
    fontFamily: Typography.fontMedium,
  },
  scroll: {
    padding: Spacing.screenPadding,
    gap: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatarHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  fields: {
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsRowLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingsRowValue: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
