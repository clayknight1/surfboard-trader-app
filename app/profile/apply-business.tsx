import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Screen from '../../components/ui/Screen';
import AuthInput from '../../components/ui/AuthInput';
import PillSelector from '../../components/ui/PillSelector';
import { Colors, Spacing, Typography } from '../../constants';
import * as Sentry from '@sentry/react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitBusinessApplication } from '../../lib/services/businessService';
import { useRequireAuth } from '../../lib/useRequireAuth';

type BusinessType = 'shop' | 'shaper';

const BUSINESS_TYPE_OPTIONS: { label: string; value: BusinessType }[] = [
  { label: 'Surf Shop', value: 'shop' },
  { label: 'Shaper', value: 'shaper' },
];

export default function ApplyScreen() {
  const auth = useRequireAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [error, setError] = useState('');

  const canSubmit =
    businessType && businessName.trim() && (website.trim() || instagram.trim());

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!auth.userId || !businessType) throw new Error('Invalid state');
      await submitBusinessApplication(auth.userId, {
        business_name: businessName.trim(),
        business_type: businessType,
        website: website.trim() || null,
        instagram_handle: instagram.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['businessApplication', auth.userId],
      });
      Alert.alert(
        'Application submitted!',
        "Thanks for applying! We'll review your application and be in touch within 48 hours.",
        [{ text: 'OK', onPress: () => router.back() }],
      );
    },
    onError: (err) => {
      Sentry.captureException(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    },
  });

  function handleSubmit() {
    if (!canSubmit) return;
    setError('');
    applyMutation.mutate();
  }

  if (!auth.ready) {
    return auth.redirect ?? null;
  }

  return (
    <Screen>
      {/* Header */}
      <ScreenHeader
        title='Shop & Shaper Application'
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Business section */}
          <Text style={styles.sectionTitle}>Your Business</Text>

          <PillSelector
            label='Business Type*'
            options={BUSINESS_TYPE_OPTIONS}
            value={businessType}
            onSelect={setBusinessType}
          />

          <AuthInput
            label='Business Name*'
            value={businessName}
            onChangeText={setBusinessName}
            placeholder='e.g. Surf Ride Oceanside'
            autoCapitalize='words'
          />

          <AuthInput
            label='Website'
            value={website}
            onChangeText={setWebsite}
            placeholder='https://yourwebsite.com'
            keyboardType='url'
            autoCapitalize='none'
          />

          <AuthInput
            label='Instagram'
            value={instagram}
            onChangeText={setInstagram}
            placeholder='@yourhandle'
            autoCapitalize='none'
          />

          <Text style={styles.hint}>
            * Please provide at least a website or Instagram so we can verify
            your business.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.button,
              (!canSubmit || applyMutation.isPending) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || applyMutation.isPending}
          >
            {applyMutation.isPending ? (
              <ActivityIndicator color={Colors.accent} />
            ) : (
              <Text style={styles.buttonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.screenPadding,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
  },
});
