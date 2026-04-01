import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  function onSelectSignIn(): void {
    router.push('/auth/login');
  }

  if (!session) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity onPress={onSelectSignIn}>
          <Text>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile</Text>
      <TouchableOpacity onPress={signOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
