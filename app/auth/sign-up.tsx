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

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/browse');
    }
  }, [session]);

  async function handleSignUp() {
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!birthYear) {
      setError('Please enter your birth year.');
      setLoading(false);
      return;
    }

    const age = new Date().getFullYear() - parseInt(birthYear);
    if (age < 13) {
      setError('You must be at least 13 years old to create an account.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) setError(error.message);
    } catch {
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
            label='Full Name'
            value={fullName}
            onChangeText={setFullName}
            placeholder='John Doe'
            textContentType='name'
            autoComplete='name'
            autoCapitalize='words'
          />
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
            textContentType='newPassword'
            autoComplete='password-new'
          />
          <AuthInput
            label='Confirm Password'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='••••••••'
            secureTextEntry
            textContentType='newPassword'
            autoComplete='password-new'
          />
          <AuthInput
            label='Birth Year'
            value={birthYear}
            onChangeText={setBirthYear}
            placeholder='1990'
            keyboardType='numeric'
            maxLength={4}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.backgroundCard} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push('/auth/apply')}>
          <Text style={styles.applyLink}>
            Are you a shop or shaper? Apply here →
          </Text>
        </TouchableOpacity>
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
  applyLink: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
