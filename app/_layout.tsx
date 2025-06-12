import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

// Create a component that will conditionally render based on auth state
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Protected routes - only visible when logged in
          <>
            <Stack.Screen
              name="CreateGroup"
              options={{
                headerShown: true,
                title: "Create a Group",
                headerBackTitle: "Cancel",
              }}
            />
            <Stack.Screen
              name="GroupDetails"
              options={{
                headerShown: true,
                title: "Group Details",
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="GroupSettings"
              options={{
                headerShown: true,
                title: "Group Settings",
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="Camera"
              options={{
                headerShown: true,
                title: "Scan Receipt",
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="AddExpense"
              options={{
                headerShown: true,
                title: "Add Expense",
              }}
            />
          </>
        ) : (
          // Auth routes - only visible when logged out
          <>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="SignUp"
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <FinancialProvider>
          <GroupsProvider>
            <RootLayoutNav />
          </GroupsProvider>
        </FinancialProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
