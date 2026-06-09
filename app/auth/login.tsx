import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Typography } from '../../constants';
import AuthInput from '../../components/ui/AuthInput';
import * as Sentry from '@sentry/react-native';
import FormError from '../../components/ui/FormError';

export default function Login() {
  const params = useLocalSearchParams<{
    justSignedUp?: string;
    email?: string;
  }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useAuth();
  const showConfirmEmailBanner = params.justSignedUp === '1';

  useEffect(() => {
    if (session && !loading) {
      router.replace('/(tabs)/browse');
    }
  }, [session, loading]);

  async function handleSignIn() {
    setLoading(true);
    setError('');
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }

      // Ban check
      if (authData.user) {
        const { data: profileRow } = await supabase
          .from('users')
          .select('is_banned')
          .eq('id', authData.user.id)
          .single();

        if (profileRow?.is_banned) {
          await supabase.auth.signOut();
          setError(
            'Your account has been suspended. Contact support@surfboardtrader.app if you think this is a mistake.',
          );
          return;
        }
      }
    } catch (err) {
      Sentry.captureException(err);
      setError("Couldn't sign you in. Check your connection and try again.");
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
        {/* Wordmark */}
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkTitle}>Surfboard</Text>
          <Text style={styles.wordmarkSubtitle}>Trader</Text>
        </View>

        {/* Just-signed-up confirmation banner */}
        {showConfirmEmailBanner && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Check your email to confirm your account, then sign in.
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <AuthInput
            label='Email'
            value={email}
            onChangeText={setEmail}
            placeholder='you@example.com'
            keyboardType='email-address'
            textContentType='emailAddress'
            autoComplete='email'
          />
          <AuthInput
            label='Password'
            value={password}
            onChangeText={setPassword}
            placeholder='••••••••'
            secureTextEntry
            textContentType='password'
            autoComplete='password'
          />
          <FormError>{error}</FormError>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
            <Text style={styles.footerLink}>Create account</Text>
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
    paddingTop: 80,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxxl,
  },
  wordmark: {
    alignItems: 'center',
    gap: 2,
  },
  wordmarkTitle: {
    ...Typography.displayLarge,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  wordmarkSubtitle: {
    ...Typography.displayLarge,
    color: Colors.accent,
    letterSpacing: -1,
  },
  form: {
    gap: Spacing.lg,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.body,
    color: Colors.accent,
    fontFamily: Typography.fontMedium,
  },
  banner: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  bannerText: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
