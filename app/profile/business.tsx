import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { getTransformUrl, processPhoto } from '../../lib/utils';
import Screen from '../../components/ui/Screen';
import AuthInput from '../../components/ui/AuthInput';
import Avatar from '../../components/ui/Avatar';
import LocationSheet from '../../components/ui/LocationSheet';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import {
  updateBusinessLocation,
  upsertBusinessProfile,
} from '../../lib/services/businessService';
import * as Sentry from '@sentry/react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';

export default function BusinessProfileScreen() {
  const router = useRouter();
  const { profile, session, refreshProfile } = useAuth();
  const userId = session?.user?.id;
  const isShaper = profile?.role === 'shaper';
  const existing = profile?.business_profiles;

  const [businessName, setBusinessName] = useState(
    existing?.business_name ?? '',
  );
  const [bio, setBio] = useState(existing?.bio ?? '');
  const [website, setWebsite] = useState(existing?.website ?? '');
  const [instagram, setInstagram] = useState(existing?.instagram_handle ?? '');
  const [locationLabel, setLocationLabel] = useState(
    existing?.location_label ?? '',
  );
  const [priceRangeLow, setPriceRangeLow] = useState(
    existing?.price_range_low?.toString() ?? '',
  );
  const [priceRangeHigh, setPriceRangeHigh] = useState(
    existing?.price_range_high?.toString() ?? '',
  );
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);

  async function pickLogo() {
    Alert.alert('Change Logo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          try {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) return;
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 1,
            });
            if (!result.canceled) {
              const { uri } = result.assets[0];
              setLogoUri(await processPhoto(uri, 400));
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
            if (!permission.granted) return;
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 1,
            });
            if (!result.canceled) {
              const { uri } = result.assets[0];
              setLogoUri(await processPhoto(uri, 400));
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

  async function uploadLogo(): Promise<string | null> {
    if (!logoUri || !userId) {
      return existing?.logo_url ?? null;
    }
    const response = await fetch(logoUri);
    const arrayBuffer = await response.arrayBuffer();
    const path = `${userId}/logo.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
    if (error) {
      throw error;
    }
    return getTransformUrl('avatars', path, 160);
  }

  async function handleSave() {
    if (!businessName.trim() || !userId) {
      return;
    }
    setIsSaving(true);
    try {
      const logoUrl = await uploadLogo();

      const payload = {
        business_name: businessName.trim(),
        bio: bio.trim() || null,
        website: website.trim() || null,
        instagram_handle: instagram.trim() || null,
        logo_url: logoUrl,
        price_range_low: priceRangeLow ? parseInt(priceRangeLow) : null,
        price_range_high: priceRangeHigh ? parseInt(priceRangeHigh) : null,
      };

      await upsertBusinessProfile(userId, payload, !!existing);

      if (locationLat && locationLng && locationLabel) {
        await updateBusinessLocation(
          userId,
          locationLat,
          locationLng,
          locationLabel,
        );
      }

      await refreshProfile();
      router.back();
    } catch (err) {
      Sentry.captureException(err);
      Alert.alert(
        'Something went wrong',
        'Could not save your business profile. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title={existing ? 'Edit Business Profile' : 'Set Up Business Profile'}
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
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <TouchableOpacity onPress={pickLogo} style={styles.logoWrapper}>
            <Avatar
              avatarUrl={logoUri ?? existing?.logo_url ?? null}
              fullName={businessName || null}
              size={80}
              shape='rounded'
            />
            <View style={styles.logoEditBadge}>
              <Ionicons name='camera' size={14} color={Colors.backgroundCard} />
            </View>
          </TouchableOpacity>
          <Text style={styles.logoHint}>Tap to upload logo</Text>
        </View>

        {/* Business name */}
        <AuthInput
          label='Business Name'
          value={businessName}
          onChangeText={setBusinessName}
          placeholder='e.g. Surf Ride Oceanside'
          autoCapitalize='words'
        />

        {/* Bio */}
        <AuthInput
          label='Bio'
          value={bio}
          onChangeText={setBio}
          placeholder='Tell buyers about your shop or shaping style...'
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 14 }}
        />

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setLocationSheetOpen(true)}
          >
            <Ionicons
              name='location-outline'
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.locationText}>
              {locationLabel || 'Set location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Website */}
        <AuthInput
          label='Website'
          value={website}
          onChangeText={setWebsite}
          placeholder='https://yourwebsite.com'
          keyboardType='url'
          autoCapitalize='none'
        />

        {/* Instagram */}
        <AuthInput
          label='Instagram'
          value={instagram}
          onChangeText={setInstagram}
          placeholder='@yourhandle'
          autoCapitalize='none'
        />

        {/* Shaper only fields */}
        {isShaper && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Custom Order Pricing</Text>
            <Text style={styles.sectionHint}>
              Optional — leave blank if you price per project
            </Text>
            <View style={styles.priceRow}>
              <View style={{ flex: 1 }}>
                <AuthInput
                  label='Starting from ($)'
                  value={priceRangeLow}
                  onChangeText={setPriceRangeLow}
                  placeholder='800'
                  keyboardType='numeric'
                />
              </View>
              <View style={{ flex: 1 }}>
                <AuthInput
                  label='Up to ($)'
                  value={priceRangeHigh}
                  onChangeText={setPriceRangeHigh}
                  placeholder='1200'
                  keyboardType='numeric'
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <LocationSheet
        isOpen={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        onLocationUpdated={(lat, lng, label) => {
          setLocationLabel(label);
          setLocationLat(lat);
          setLocationLng(lng);
        }}
      />
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
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  logoSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  logoWrapper: {
    position: 'relative',
  },
  logoEditBadge: {
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
  logoHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  field: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  locationText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  sectionHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
