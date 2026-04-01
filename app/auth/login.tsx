import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Auth() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/browse');
    }
  }, [session]);

  async function handleSignIn(): Promise<void> {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
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
      <TouchableOpacity onPress={handleSignIn}>
        <Text>Sign In Button</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
        <Text>Don't have an account? Sign up</Text>
      </TouchableOpacity>

      {error ? <Text>{error}</Text> : null}
    </View>
  );
}
