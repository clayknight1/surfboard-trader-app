import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { ListingFormData } from '../../lib/types';
import Screen from '../../components/ui/Screen';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
// import StepType from '../../components/listings/steps/StepType';
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
import { useQueryClient, useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { userCurrency } from '../../lib/utils';

const TOTAL_STEPS = 5;

export default function CreateListing() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const posthog = usePostHog();
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
    currency: profile?.currency ?? userCurrency,
    user_id: userId!,
  });

  const createListingMutation = useMutation({
    mutationFn: async () => {
      const listingId = await createListing(formData);
      try {
        await uploadListingPhotos(listingId, userId!, photos);
      } catch (uploadErr) {
        // Rollback: delete the listing if photo upload fails
        try {
          await deleteListing(listingId, userId!);
        } catch (deleteErr) {
          Sentry.captureException(deleteErr, {
            extra: { context: 'cleanup_after_upload_failure', listingId },
          });
        }
        throw uploadErr;
      }
      return listingId;
    },
    onSuccess: (listingId) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        (err) =>
          Sentry.captureException(err, {
            extra: { context: 'haptics_notification' },
          }),
      );

      posthog.capture('listing_created', {
        board_type: formData.board_type ?? null,
        listing_type: formData.listing_type ?? null,
        has_volume: formData.volume !== null,
        photo_count: photos.length,
      });

      router.replace(`/listings/${listingId}`);
    },
    onError: (err) => {
      Sentry.captureException(err, {
        extra: {
          formData,
          hasPhotos: photos.length > 0,
          photoCount: photos.length,
        },
      });

      const isLimitError =
        err instanceof Error && err.message.includes('Listing limit reached');

      Alert.alert(
        isLimitError ? 'Listing limit reached' : 'Something went wrong',
        isLimitError
          ? 'You have reached your listing limit. Upgrade your plan to list more boards.'
          : 'Could not create your listing. Please try again.',
      );
    },
  });

  function updateField<K extends keyof ListingFormData>(
    key: K,
    value: ListingFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
          accessibilityLabel='Go back'
          hitSlop={10}
        >
          <Ionicons name='chevron-back' size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>
          Step {step} of {TOTAL_STEPS}
        </Text>
        <TouchableOpacity
          onPress={handleAbandon}
          accessibilityLabel='Cancel listing'
        >
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
      {/* Add step 1 back when we add business listings */}
      {/* {step === 1 && (
        <StepType
          formData={formData}
          updateField={updateField}
          profile={profile}
          onNext={() => setStep(2)}
          isEditing={false}
        />
      )} */}
      {step === 1 && (
        <StepPhotos
          photos={photos}
          setPhotos={setPhotos}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepDetails
          formData={formData}
          updateField={updateField}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
          isEditing={false}
        />
      )}
      {step === 3 && (
        <StepsSpec
          formData={formData}
          updateField={updateField}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
          isEditing={false}
        />
      )}
      {step === 4 && (
        <StepLocation
          formData={formData}
          profile={profile}
          updateField={updateField}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
          isEditing={false}
        />
      )}
      {step === 5 && (
        <StepPricing
          formData={formData}
          updateField={updateField}
          onBack={() => setStep(4)}
          handleSubmit={() => createListingMutation.mutate()}
          isSubmitting={createListingMutation.isPending}
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
