import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }
  return <Redirect href='/(tabs)/browse' />;
}
