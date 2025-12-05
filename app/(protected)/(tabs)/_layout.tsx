import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        // 1. Theme Colors
        tabBarActiveTintColor: '#0a7ea4', // Your primary color
        tabBarInactiveTintColor: '#8E8E93',
        // 2. Hide the top border for a clean look
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0, 
          elevation: 0, // Remove shadow on Android
          height: Platform.OS === 'ios' ? 88 : 60, // Taller bar for better touch
          paddingBottom: Platform.OS === 'ios' ? 28 : 8, // Adjust padding
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        // 3. Dynamic Icons (Filled when active, Outline when inactive)
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="Groups" options={{ title: 'Groups' }} />
      <Tabs.Screen name="History" options={{ title: 'Activity' }} />
      <Tabs.Screen name="Profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}