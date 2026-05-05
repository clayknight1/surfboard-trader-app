import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { ListingFormData } from '../../lib/types';
import Screen from '../../components/ui/Screen';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import StepType from '../../components/listings/steps/StepType';
import StepPhotos from '../../components/listings/steps/StepPhotos';
import StepDetails from '../../components/listings/steps/StepDetails';
import StepsSpec from '../../components/listings/steps/StepSpecs';
import StepLocation from '../../components/listings/steps/StepLocation';
import StepPricing from '../../components/listings/steps/StepPricing';
import {
  createListing,
  deleteListing,
  uploadListingPhotos,
} from '../../lib/services/listingService';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

const TOTAL_STEPS = 6;

export default function CreateListing() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({
    listing_type: 'for_sale',
    title: '',
    description: null,
    price: null,
    board_type: null,
    volume: null,
    length_feet: null,
    length_inches_remainder: null,
    width_inches: null,
    thickness_inches: null,
    fin_system: null,
    fin_setup: null,
    shaper_brand: null,
    condition: null,
    era: null,
    is_rideable: null,
    provenance: null,
    lead_time_weeks: null,
    lat: null,
    lng: null,
    location_label: null,
    ships_domestically: false,
    ships_internationally: false,
    shipping_notes: null,
    accepts_offers: false,
    payment_notes: null,
    currency: 'USD',
    user_id: userId!,
  });

  function updateField<K extends keyof ListingFormData>(
    key: K,
    value: ListingFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    let listingId: string | null = null;
    try {
      listingId = await createListing(formData);
      await uploadListingPhotos(listingId, userId!, photos);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/listings/${listingId}`);
    } catch (err) {
      console.error('Error creating listing:', err);
      if (listingId) {
        try {
          await deleteListing(listingId, userId!);
        } catch (deleteErr) {
          console.error(
            'Failed to clean up listing after photo error:',
            deleteErr,
          );
        }
      }
      const message =
        err instanceof Error && err.message.includes('Listing limit reached')
          ? 'You have reached your listing limit. Upgrade your plan to list more boards.'
          : 'Could not create your listing. Please try again.';

      const title =
        err instanceof Error && err.message.includes('Listing limit reached')
          ? 'Listing limit reached'
          : 'Something went wrong';

      Alert.alert(title, message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAbandon() {
    Alert.alert('Abandon listing?', 'Your progress will be lost.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Abandon', style: 'destructive', onPress: () => router.back() },
    ]);
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === 1 ? router.back() : setStep(step - 1))}
          hitSlop={10}
        >
          <Ionicons name='chevron-back' size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>
          Step {step} of {TOTAL_STEPS}
        </Text>
        <TouchableOpacity onPress={handleAbandon}>
          <Ionicons name='close' size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(step / TOTAL_STEPS) * 100}%` },
          ]}
        />
      </View>

      {/* Steps */}
      {step === 1 && (
        <StepType
          formData={formData}
          updateField={updateField}
          profile={profile}
          onNext={() => setStep(2)}
          isEditing={false}
        />
      )}
      {step === 2 && (
        <StepPhotos
          photos={photos}
          setPhotos={setPhotos}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepDetails
          formData={formData}
          updateField={updateField}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
          isEditing={false}
        />
      )}
      {step === 4 && (
        <StepsSpec
          formData={formData}
          updateField={updateField}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
          isEditing={false}
        />
      )}
      {step === 5 && (
        <StepLocation
          formData={formData}
          profile={profile}
          updateField={updateField}
          onNext={() => setStep(6)}
          onBack={() => setStep(4)}
          isEditing={false}
        />
      )}
      {step === 6 && (
        <StepPricing
          formData={formData}
          updateField={updateField}
          onBack={() => setStep(5)}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
  },
  stepLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 2,
    backgroundColor: Colors.backgroundSubtle,
    marginHorizontal: Spacing.screenPadding,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
});
