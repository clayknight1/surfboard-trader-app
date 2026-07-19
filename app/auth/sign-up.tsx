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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Typography } from '../../constants';
import AuthInput from '../../components/ui/AuthInput';
import { userCurrency } from '../../lib/utils';
import * as Sentry from '@sentry/react-native';
import FormError from '../../components/ui/FormError';

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
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
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
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), currency: userCurrency },
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      // If no session was returned, email confirmation is ON — bounce to login
      if (!data.session) {
        router.replace({
          pathname: '/auth/login',
          params: { justSignedUp: '1', email: email.trim() },
        });
      }
    } catch (err) {
      Sentry.captureException(err);
      setError(
        "Couldn't create your account. Check your connection and try again.",
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
        {/* Logo */}
        <Image
          source={require('../../assets/login-screen-logo.png')}
          style={styles.logo}
          resizeMode='contain'
        />

        {/* Form */}
        <View style={styles.form}>
          <AuthInput
            label='Full Name *'
            value={fullName}
            onChangeText={setFullName}
            placeholder='John Doe'
            autoCapitalize='words'
            textContentType='name'
            maxLength={40}
          />
          <AuthInput
            label='Email'
            value={email}
            onChangeText={setEmail}
            placeholder='you@example.com'
            keyboardType='email-address'
            textContentType='emailAddress'
            autoCapitalize='none'
            maxLength={100}
          />
          <AuthInput
            label='Password'
            value={password}
            onChangeText={setPassword}
            placeholder='••••••••'
            secureTextEntry
            textContentType='newPassword'
            passwordRules='minlength: 8;'
            autoCapitalize='none'
            autoCorrect={false}
            maxLength={72}
          />
          <AuthInput
            label='Confirm Password'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='••••••••'
            secureTextEntry
            textContentType='newPassword'
            passwordRules='minlength: 8;'
            autoCapitalize='none'
            autoCorrect={false}
            maxLength={72}
          />
          <AuthInput
            label='Birth Year'
            value={birthYear}
            onChangeText={setBirthYear}
            placeholder='1990'
            keyboardType='number-pad'
            maxLength={4}
          />
          <FormError>{error}</FormError>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.bottomGroup}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.applyLink}>
            Shop or shaper? Sign up and apply from your profile.
          </Text>

          <View style={styles.legalRow}>
            <Text style={styles.legalText}>
              By signing up you agree to our{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/legal/terms')}>
              <Text style={styles.legalLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.legalText}> and </Text>
            <TouchableOpacity
              onPress={() => router.push('/legal/privacy-policy')}
            >
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
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
  logo: {
    width: 240,
    height: 160,
    alignSelf: 'center',
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
  applyLink: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  legalLink: {
    ...Typography.caption,
    color: Colors.accent,
  },
  bottomGroup: {
    gap: Spacing.sm, // tight gap between the three lines
    alignItems: 'center', // matches the centered look of the existing items
  },
});
