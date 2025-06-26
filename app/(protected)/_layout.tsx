import { ActivityProvider } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function ProtectedLayout() {
  const { token, loading } = useAuth();

  // Don't redirect while loading
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!token) {
    return <Redirect href="/SignIn" />;
  }

  return (
    <FinancialProvider>
      <ActivityProvider>
        <GroupsProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="GroupDetails" options={{ title: 'Group Details', headerBackTitle: 'Back', headerTintColor: 'white', headerStyle: { backgroundColor: '#2a2a2a' } }} />
            <Stack.Screen name="AddExpense" options={{ title: 'Add Expense', headerBackTitle: 'Back', headerTintColor: 'white', headerStyle: { backgroundColor: '#2a2a2a' } }} />
            <Stack.Screen name="Camera" options={{ title: 'Scan Expense', headerBackTitle: 'Back', headerTintColor: 'white', headerStyle: { backgroundColor: '#2a2a2a' } }} />
            <Stack.Screen name="CreateGroup" options={{ title: 'Create Group', headerBackTitle: 'Back', headerTintColor: 'white', headerStyle: { backgroundColor: '#2a2a2a' } }} />
            <Stack.Screen name="GroupSettings" options={{ title: 'Group Settings', headerBackTitle: 'Back', headerTintColor: 'white', headerStyle: { backgroundColor: '#2a2a2a' } }} />
            <Stack.Screen name="EditProfile" options={{ title: 'Edit Profile', headerBackTitle: 'Back', headerTintColor: 'white', headerStyle: { backgroundColor: '#2a2a2a' } }} />
            <Stack.Screen name="SettleUp" options={{ title: 'Settle Up', headerBackTitle: 'Back', headerTintColor: 'white', headerStyle: { backgroundColor: '#2a2a2a' } }} />
          </Stack>
        </GroupsProvider>
      </ActivityProvider>
    </FinancialProvider>
  );
}


