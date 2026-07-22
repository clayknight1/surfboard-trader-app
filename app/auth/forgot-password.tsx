import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Typography } from '../../constants';
import AuthInput from '../../components/ui/AuthInput';
import * as Sentry from '@sentry/react-native';
import FormError from '../../components/ui/FormError';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: 'https://surfboardtrader.app/auth/reset-password' },
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      Sentry.captureException(err);
      setError(
        "Couldn't send reset email. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../assets/login-screen-logo.png')}
          style={styles.logo}
          resizeMode='contain'
        />

        {sent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successMessage}>
              If an account exists for {email.trim()}, we sent a link to reset
              your password.
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.intro}>
              Enter the email you signed up with and we&apos;ll send you a link
              to reset your password.
            </Text>
            <AuthInput
              label='Email'
              value={email}
              onChangeText={setEmail}
              placeholder='you@example.com'
              keyboardType='email-address'
              textContentType='emailAddress'
              autoComplete='email'
            />
            <FormError>{error}</FormError>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.buttonText}>Send reset link</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.replace('/auth/login')}>
            <Text style={styles.footerLink}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 40,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxxl,
    justifyContent: 'center',
  },
  logo: {
    width: 240,
    height: 160,
    alignSelf: 'center',
  },
  form: {
    gap: Spacing.lg,
  },
  intro: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
  successContainer: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  successTitle: {
    ...Typography.displaySmall,
    color: Colors.textPrimary,
  },
  successMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLink: {
    ...Typography.body,
    color: Colors.accent,
    fontFamily: Typography.fontMedium,
  },
});
