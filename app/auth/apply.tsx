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
import { supabase } from '../../lib/supabase';
import Screen from '../../components/ui/Screen';
import AuthInput from '../../components/ui/AuthInput';
import PillSelector from '../../components/ui/PillSelector';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { userCurrency } from '../../lib/utils';
import ScreenHeader from '../../components/ui/ScreenHeader';

type BusinessType = 'shop' | 'shaper';

const BUSINESS_TYPE_OPTIONS: { label: string; value: BusinessType }[] = [
  { label: 'Surf Shop', value: 'shop' },
  { label: 'Shaper', value: 'shaper' },
];

export default function ApplyScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');

  const canSubmit =
    fullName.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    businessType &&
    businessName.trim() &&
    (website.trim() || instagram.trim());

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!birthYear) {
      setError('Please enter your birth year.');
      return;
    }

    const parsedYear = parseInt(birthYear);
    if (!Number.isFinite(parsedYear) || !/^\d{4}$/.test(birthYear)) {
      setError('Please enter a valid birth year.');
      return;
    }
    const age = new Date().getFullYear() - parsedYear;
    if (age < 13) {
      setError('You must be at least 13 years old to create an account.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), currency: userCurrency },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }
      if (!authData.user) {
        throw new Error('Could not create account');
      }

      // Submit application
      const { error: appError } = await supabase
        .from('business_applications')
        .insert({
          user_id: authData.user.id,
          business_name: businessName.trim(),
          business_type: businessType,
          website: website.trim() || null,
          instagram_handle: instagram.trim() || null,
        });

      if (appError) {
        throw new Error(appError.message);
      }

      Alert.alert(
        'Application submitted!',
        "Thanks for applying! We'll review your application and be in touch within 48 hours.",
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/browse') }],
      );
    } catch (err: any) {
      Sentry.captureException(err);
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Account section */}
          <Text style={styles.sectionTitle}>Your Account</Text>

          <AuthInput
            label='Full Name*'
            value={fullName}
            onChangeText={setFullName}
            placeholder='John Doe'
            autoCapitalize='words'
            textContentType='name'
          />
          <AuthInput
            label='Email*'
            value={email}
            onChangeText={setEmail}
            placeholder='you@example.com'
            keyboardType='email-address'
            textContentType='emailAddress'
          />
          <AuthInput
            label='Password*'
            value={password}
            onChangeText={setPassword}
            placeholder='••••••••'
            secureTextEntry
            textContentType='newPassword'
          />
          <AuthInput
            label='Confirm Password*'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='••••••••'
            secureTextEntry
            textContentType='newPassword'
          />

          {/* Divider */}
          <View style={styles.divider} />

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
            label='Birth Year*'
            value={birthYear}
            onChangeText={setBirthYear}
            placeholder='1990'
            keyboardType='numeric'
            maxLength={4}
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
              (!canSubmit || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
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
