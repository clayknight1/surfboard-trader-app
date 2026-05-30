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
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Typography } from '../../constants';
import AuthInput from '../../components/ui/AuthInput';
import * as Sentry from '@sentry/react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/browse');
    }
  }, [session]);

  async function handleSignIn() {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    } catch (err) {
      Sentry.captureException(err);
      setError('Something went wrong. Please try again.');
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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.accent} />
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
  error: {
    ...Typography.caption,
    color: Colors.error,
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
});
