import { ActivityProvider } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { SettlementProvider } from "@/contexts/SettlementContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";

export default function ProtectedLayout() {
  const { token, loading } = useAuth();

  const [loaded, error] = useFonts({
    "Inter-Bold": require("../../assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-Regular": require("../../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Medium": require("../../assets/fonts/Inter_18pt-Medium.ttf"),
  });

  if (!loaded || error) {
    return null;
  }

  // Don't redirect while loading
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!token) {
    return <Redirect href="/SignIn" />;
  }

  return (
    <>
  <StatusBar 
  barStyle="dark-content"  
  backgroundColor="#f5f5f5"   
  translucent={false}
/>
    <FinancialProvider>
      <ActivityProvider>
        <GroupsProvider>
          <ExpenseProvider>
            <SettlementProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="GroupDetails"
                      options={{
                        title: "Group Details",
                        headerShown: false,
                        headerTitleStyle: {
                        },
                      }}
                    />
                    <Stack.Screen
                      name="AddExpense"
                      options={{
                        title: "Add Expense",
                      headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="Camera"
                      options={{
                        title: "Scan Expense",
                        headerShown: false
                      }}
                    />
                    <Stack.Screen
                      name="CreateGroup"
                      options={{
                        title: "Create Group",
                        headerShown:false
                      }}
                    />
                    <Stack.Screen
                      name="GroupSettings"
                      options={{
                        title: "Group Settings",
                        headerShown: false
                      }}
                    />
                    <Stack.Screen
                      name="EditProfile"
                      options={{
                        title: "Edit Profile",
                        headerShown: false
                      }}
                    />
                    <Stack.Screen
                      name="SettleUp"
                      options={{
                        title: "Settle Up",
                        headerShown: false
                      }}
                    />
                    <Stack.Screen
                      name="ExpenseDetails"
                      options={{
                        headerShown: false,
                      }}
                    />
                  </Stack>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SettlementProvider>
          </ExpenseProvider>
        </GroupsProvider>
      </ActivityProvider>
    </FinancialProvider>
    </>

  );
}
