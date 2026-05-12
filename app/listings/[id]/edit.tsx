import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import {
  deleteListing,
  getListing,
  updateListing,
  updateListingLocation,
} from '../../../lib/services/listingService';
import { ListingFormData } from '../../../lib/types';
import Screen from '../../../components/ui/Screen';
import { Colors, Spacing, Typography } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';
import StepDetails from '../../../components/listings/steps/StepDetails';
import StepSpecs from '../../../components/listings/steps/StepSpecs';
import StepPricing from '../../../components/listings/steps/StepPricing';
import StepLocation from '../../../components/listings/steps/StepLocation';
import * as Sentry from '@sentry/react-native';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, profile } = useAuth();
  const userId = session?.user?.id!;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ListingFormData | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
  });

  useEffect(() => {
    if (!data) return;

    const lengthFeet = data.length_inches
      ? Math.floor(Number(data.length_inches) / 12)
      : null;
    const lengthInchesRemainder = data.length_inches
      ? Number(data.length_inches) % 12
      : null;

    setFormData({
      listing_type: data.listing_type,
      title: data.title,
      description: data.description,
      price: data.price,
      board_type: data.board_type,
      volume: data.volume,
      length_feet: lengthFeet,
      length_inches_remainder: lengthInchesRemainder,
      width_inches: data.width_inches,
      thickness_inches: data.thickness_inches,
      fin_system: data.fin_system,
      fin_setup: data.fin_setup,
      shaper_brand: data.shaper_brand,
      condition: data.condition,
      era: data.era,
      is_rideable: data.is_rideable,
      provenance: data.provenance,
      lead_time_weeks: data.lead_time_weeks,
      lat: null,
      lng: null,
      location_label: data.location_label,
      ships_domestically: data.ships_domestically ?? false,
      ships_internationally: data.ships_internationally ?? false,
      shipping_notes: data.shipping_notes,
      accepts_offers: data.accepts_offers ?? false,
      payment_notes: data.payment_notes,
      currency: data.currency ?? 'USD',
      user_id: userId,
    });
  }, [data]);

  function updateField<K extends keyof ListingFormData>(
    key: K,
    value: ListingFormData[K],
  ) {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!formData || !id) return;
    setIsSaving(true);
    try {
      await updateListing(id, formData);

      const locationChanged = formData.lat !== null && formData.lng !== null;

      if (
        locationChanged &&
        formData.lat &&
        formData.lng &&
        formData.location_label
      ) {
        await updateListingLocation(
          id,
          formData.lat,
          formData.lng,
          formData.location_label,
        );
      }

      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      router.back();
    } catch (err) {
      Sentry.captureException(err);
      Alert.alert(
        'Something went wrong',
        'Could not save your listing. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete listing?',
      'This cannot be undone. Your listing and all photos will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListing(id, userId);
              router.replace('/(tabs)/sell');
              queryClient.invalidateQueries({ queryKey: ['userListings'] });
              queryClient.invalidateQueries({ queryKey: ['listings'] });
            } catch (err) {
              Sentry.captureException(err);
              Alert.alert(
                'Something went wrong',
                'Could not delete your listing.',
              );
            }
          },
        },
      ],
    );
  }

  if (isPending || !formData) {
    return (
      <Screen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons
              name='chevron-back'
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name='chevron-back' size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size='small' color={Colors.accent} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <StepDetails
          formData={formData}
          updateField={updateField}
          isEditing={true}
        />
        <View style={styles.divider} />
        <StepSpecs
          formData={formData}
          updateField={updateField}
          isEditing={true}
        />
        <View style={styles.divider} />
        <StepLocation
          formData={formData}
          profile={profile}
          updateField={updateField}
          isEditing={true}
        />
        <View style={styles.divider} />
        <StepPricing
          formData={formData}
          updateField={updateField}
          handleSubmit={handleSave}
          isSubmitting={isSaving}
          isEditing={true}
        />
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Listing</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  saveButton: {
    ...Typography.body,
    color: Colors.accent,
    fontFamily: Typography.fontMedium,
  },
  divider: {
    height: 8,
    backgroundColor: Colors.background,
  },
  deleteButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  deleteButtonText: {
    ...Typography.body,
    color: Colors.error,
    fontFamily: Typography.fontMedium,
  },
});
