import { ActivityProvider } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { ActivityIndicator } from "react-native";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't redirect while loading
  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/SignIn" />;
  }

  return (
    <FinancialProvider>
      <ActivityProvider>
        <GroupsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </GroupsProvider>
      </ActivityProvider>
    </FinancialProvider>
  );
}
