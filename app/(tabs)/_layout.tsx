import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tabs.Screen name='browse' options={{ title: 'Browse' }} />
      <Tabs.Screen name='sell' options={{ title: 'Sell' }} />
      <Tabs.Screen name='messages' options={{ title: 'Messages' }} />
      <Tabs.Screen name='profile' options={{ title: 'Profile' }} />
    </Tabs>
  );
}
