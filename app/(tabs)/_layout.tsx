import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSubtle,
          borderTopWidth: 0.5,
          borderTopColor: Colors.border,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name='browse'
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='search' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='sell'
        options={{
          title: 'Sell',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='add-circle-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='messages'
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='chatbubble-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person-outline' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
