import { Tabs } from 'expo-router';
import React from 'react';

import TabBar from '@/components/TabBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {

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
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="Groups"
        options={{
          title: 'Groups',
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          title: 'Activity',
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
