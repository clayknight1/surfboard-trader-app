import { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Spacing, Typography } from '../../constants';
import { updateUserLocation } from '../../lib/services/userService';
import { useAuth } from '../../lib/auth';

type LocationSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onLocationUpdated?: (lat: number, lng: number, label: string) => void;
};

export default function LocationSheet({
  isOpen,
  onClose,
  onLocationUpdated,
}: LocationSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [addressInput, setAddressInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session, refreshProfile } = useAuth();
  const userId = session?.user?.id;

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  async function useCurrentLocation() {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied.');
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const label = `${result.city}, ${result.region}`;
      if (onLocationUpdated) {
        onLocationUpdated(latitude, longitude, label);
      } else if (userId) {
        await updateUserLocation(userId, latitude, longitude, label);
        await refreshProfile();
      }
      onClose();
    } catch {
      setError('Could not get your location. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function searchAddress() {
    if (!addressInput.trim()) {
      return;
    }
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
      const label = `${result.city}, ${result.region}`;
      if (onLocationUpdated) {
        onLocationUpdated(latitude, longitude, label);
      } else if (userId) {
        await updateUserLocation(userId, latitude, longitude, label);
        await refreshProfile();
      }
      onClose();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['50%']}
      enablePanDownToClose
      onChange={handleSheetChange}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>Change Location</Text>

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
            {isLoading ? (
              <ActivityIndicator size='small' color={Colors.accent} />
            ) : (
              <Ionicons name='search' size={18} color={Colors.backgroundCard} />
            )}
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.backgroundSheet,
  },
  handleIndicator: {
    backgroundColor: Colors.border,
  },
  container: {
    padding: Spacing.screenPadding,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundInput,
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
  error: {
    ...Typography.caption,
    color: Colors.error,
  },
});
