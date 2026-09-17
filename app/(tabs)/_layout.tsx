import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { colors, fonts } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: '#B4AA9A',
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: '#00000010' },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Boards', tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="awards"
        options={{ title: 'Awards', tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
