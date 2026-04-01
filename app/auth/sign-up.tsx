import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function SignUp() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/browse');
    }
  }, [session]);

  async function handleSignUp(): Promise<void> {
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TextInput
        placeholder='email'
        textContentType='emailAddress'
        value={email}
        onChangeText={setEmail}
        style={{
          width: '80%',
          height: 44,
          borderWidth: 0.5,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 12,
        }}
      />
      <TextInput
        placeholder='password'
        textContentType='password'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          width: '80%',
          height: 44,
          borderWidth: 0.5,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 12,
        }}
      />
      <TextInput
        placeholder='confirm password'
        textContentType='password'
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={{
          width: '80%',
          height: 44,
          borderWidth: 0.5,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 12,
        }}
      />
      <TouchableOpacity onPress={handleSignUp}>
        <Text>Sign Up Button</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text>Already have an account? Sign in</Text>
      </TouchableOpacity>

      {error ? <Text>{error}</Text> : null}
    </View>
  );
}
