import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StepProps, User } from '../../../lib/types';
import { Colors, Spacing, Typography } from '../../../constants';
import { updateUserLocation } from '../../../lib/services/userService';
import { useAuth } from '../../../lib/auth';
import { updateBusinessLocation } from '../../../lib/services/businessService';
import * as Sentry from '@sentry/react-native';
import { buildLocationLabel } from '../../../lib/utils';
import FormError from '../../ui/FormError';

type StepLocationProps = StepProps & {
  profile: User | null;
};

export default function StepLocation({
  profile,
  formData,
  updateField,
  onNext,
  isEditing,
}: StepLocationProps) {
  const isShopOrShaper = profile?.role === 'shop' || profile?.role === 'shaper';
  const hasLocation = isShopOrShaper
    ? !!profile?.business_profiles?.lat
    : !!profile?.lat;

  const [locationLabel, setLocationLabel] = useState<string | null>(
    formData.location_label ??
      (isShopOrShaper
        ? (profile?.business_profiles?.location_label ?? null)
        : (profile?.location_label ?? null)),
  );
  const [isEditingLocation, setIsEditingLocation] = useState(!hasLocation);
  const [addressInput, setAddressInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshProfile } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    if (!profile) {
      return;
    }

    const savedLabel = isShopOrShaper
      ? profile?.business_profiles?.location_label
      : profile?.location_label;

    if (savedLabel) {
      initialized.current = true;
      setLocationLabel(savedLabel);
      updateField('location_label', savedLabel);

      if (
        isShopOrShaper &&
        profile?.business_profiles?.lat &&
        profile?.business_profiles?.lng
      ) {
        updateField('lat', profile.business_profiles.lat);
        updateField('lng', profile.business_profiles.lng);
        setIsEditingLocation(false);
      } else if (!isShopOrShaper && profile?.lat && profile?.lng) {
        updateField('lat', profile.lat);
        updateField('lng', profile.lng);
        setIsEditingLocation(false);
      } else {
        setIsEditingLocation(true);
      }
    }
  }, [profile]);

  async function useCurrentLocation(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('We need location access. Enable it in Settings.');
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const label = buildLocationLabel(result);
      setLocationLabel(label);
      setIsEditingLocation(false);
      updateField('lat', latitude);
      updateField('lng', longitude);
      updateField('location_label', label);

      if (profile?.id) {
        try {
          if (isShopOrShaper && !profile.business_profiles?.lat) {
            await updateBusinessLocation(
              profile.id,
              latitude,
              longitude,
              label,
            );
            await refreshProfile();
          } else if (!isShopOrShaper && !profile?.lat) {
            await updateUserLocation(profile.id, latitude, longitude, label);
            await refreshProfile();
          }
        } catch (err) {
          Sentry.captureException(err);
        }
      }
    } catch (err) {
      Sentry.captureException(err);
      setError("Couldn't get your location. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function searchAddress(): Promise<void> {
    if (!addressInput.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const results = await Location.geocodeAsync(addressInput);
      if (!results.length) {
        setError('Address not found. Try being more specific.');
        return;
      }
      const { latitude, longitude } = results[0];
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const label = buildLocationLabel(result);
      setLocationLabel(label);
      setIsEditingLocation(false);
      updateField('lat', latitude);
      updateField('lng', longitude);
      updateField('location_label', label);

      if (profile?.id) {
        try {
          if (isShopOrShaper && !profile.business_profiles?.lat) {
            await updateBusinessLocation(
              profile.id,
              latitude,
              longitude,
              label,
            );
            await refreshProfile();
          } else if (!isShopOrShaper && !profile?.lat) {
            await updateUserLocation(profile.id, latitude, longitude, label);
            await refreshProfile();
          }
        } catch (err) {
          Sentry.captureException(err);
        }
      }
    } catch (err) {
      Sentry.captureException(err);
      setError("Couldn't find that address. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>Where is the board located?</Text>
        <Text style={styles.hint}>Only your city will be shown to buyers.</Text>
        {/* Current location display */}
        {locationLabel && !isEditingLocation && (
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons name='location' size={18} color={Colors.accent} />
              <Text style={styles.locationText}>{locationLabel}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditingLocation(true)}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Change location options */}
        {isEditingLocation && (
          <View style={styles.changeOptions}>
            {/* GPS button */}
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={useCurrentLocation}
              disabled={isLoading}
            >
              <Ionicons
                name='navigate-outline'
                size={18}
                color={Colors.textPrimary}
              />
              <Text style={styles.gpsButtonText}>
                {isLoading ? 'Getting location...' : 'Use current location'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Manual address entry */}
            <View style={styles.addressRow}>
              <TextInput
                style={styles.addressInput}
                value={addressInput}
                onChangeText={setAddressInput}
                placeholder='Enter city or address...'
                placeholderTextColor={Colors.textSecondary}
                returnKeyType='search'
                onSubmitEditing={searchAddress}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchAddress}
                disabled={isLoading}
              >
                <Ionicons
                  name='search'
                  size={18}
                  color={Colors.backgroundCard}
                />
              </TouchableOpacity>
            </View>

            {/* Cancel if they already have a location */}
            {locationLabel && (
              <TouchableOpacity onPress={() => setIsEditingLocation(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* Error */}
        <FormError>{error}</FormError>.{/* First listing hint */}
        {!hasLocation && (
          <Text style={styles.saveHint}>
            This will be saved to your profile for future listings.
          </Text>
        )}
      </View>

      {/* Continue */}
      {!isEditing && (
        <TouchableOpacity
          style={[
            styles.nextButton,
            !locationLabel && styles.nextButtonDisabled,
          ]}
          onPress={onNext}
          disabled={!locationLabel}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  content: {
    flex: 1,
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  question: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: -Spacing.md,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    padding: Spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  locationText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  changeText: {
    ...Typography.body,
    color: Colors.accent,
  },
  changeOptions: {
    gap: Spacing.md,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    paddingVertical: 14,
  },
  gpsButtonText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addressInput: {
    flex: 1,
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  searchButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  saveHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  nextButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
});
