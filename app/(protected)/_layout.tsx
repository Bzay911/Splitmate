import { ActivityProvider } from "@/contexts/ActivityContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { Stack } from "expo-router";

export default function ProtectedLayout() {
  return (
    <FinancialProvider>
      <ActivityProvider>
        <GroupsProvider>
          <Stack screenOptions={{ headerShown: false }}>
          </Stack>
        </GroupsProvider>
      </ActivityProvider>
    </FinancialProvider>
  );
}
