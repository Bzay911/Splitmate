import { Tabs } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import IconFA from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import * as Haptics from "expo-haptics";

const iconMapping = {
  index: { outline: "th-large", filled: "th-large" },
  Groups: { outline: "users", filled: "users" },
  Profile: { outline: "user-circle", filled: "user-circle" },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarButton: (props) => {
          const { onPress, children, style } = props;

          return (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress?.({} as any);
              }}
              style={style}
              activeOpacity={1}
            >
              {children}
            </TouchableOpacity>
          );
        },

        tabBarActiveTintColor: "#0a7ea4",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 88 : 65,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter-Regular",
        },

        tabBarIcon: ({ focused, color }) => {
          if (route.name === "History") {
            return <Feather name="trending-up" size={22} color={color} />;
          }

          const iconKey = route.name as keyof typeof iconMapping;
          const iconSet = iconMapping[iconKey];
          if (!iconSet) return null;

          const iconName = focused ? iconSet.filled : iconSet.outline;

          return <IconFA name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="Groups" options={{ title: "Groups" }} />
      <Tabs.Screen name="History" options={{ title: "Activity" }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
