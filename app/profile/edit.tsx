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

export default function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
            Alert.alert(
              'Something went wrong',
              'Could not take photo. Please try again.',
            );
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
            Alert.alert(
              'Something went wrong',
              'Could not select photo. Please try again.',
            );
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleSave() {
    if (!profile?.id) {
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    setIsSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      if (avatarUri) {
        avatarUrl = await uploadAvatar(profile.id, avatarUri);
      }

      await updateUserProfile(profile.id, {
        full_name: fullName.trim(),
        avatar_url: avatarUrl ?? undefined,
      });

      await refreshProfile();
      router.back();
    } catch (err) {
      Sentry.captureException(err);
      Alert.alert(
        'Something went wrong',
        'Could not save your profile. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title='Edit Profile'
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
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
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrapper}>
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
});
