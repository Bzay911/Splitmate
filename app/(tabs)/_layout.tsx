import { Tabs } from 'expo-router';
import React from 'react';

import TabBar from '@/components/TabBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false
      }}
      tabBar={(props) => <TabBar {...props} />}
      >

      <Tabs.Screen
        name="Home"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Groups"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons size={32} name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons size={32} name="reload" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons size={32} name="person" color={color}/>,
        }}
      />
    </Tabs>
  );
}
