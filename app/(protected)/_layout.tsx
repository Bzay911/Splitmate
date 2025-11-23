import { ActivityProvider } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { SettlementProvider } from "@/contexts/SettlementContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native";
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
                        headerBackTitle: "Back",
                        headerTintColor: "white",
                        headerStyle: { backgroundColor: "black" },
                        headerTitleStyle: {
                          fontFamily: "Inter-Regular",
                          fontSize: 18,
                        },
                      }}
                    />
                    <Stack.Screen
                      name="AddExpense"
                      options={{
                        title: "Add Expense",
                        headerBackTitle: "Back",
                        headerTintColor: "white",
                        headerStyle: { backgroundColor: "black" },
                      }}
                    />
                    <Stack.Screen
                      name="Camera"
                      options={{
                        title: "Scan Expense",
                        headerBackTitle: "Back",
                        headerTintColor: "white",
                        headerStyle: { backgroundColor: "black" },
                        headerTitleStyle: {
                          fontFamily: "Inter-Regular",
                          fontSize: 18,
                        },
                      }}
                    />
                    <Stack.Screen
                      name="CreateGroup"
                      options={{
                        title: "Create Group",
                        headerBackTitle: "Back",
                        headerTintColor: "white",
                        headerStyle: { backgroundColor: "black" },
                        headerTitleStyle: {
                          fontFamily: "Inter-Regular",
                          fontSize: 18,
                        },
                      }}
                    />
                    <Stack.Screen
                      name="GroupSettings"
                      options={{
                        title: "Group Settings",
                        headerBackTitle: "Back",
                        headerTintColor: "white",
                        headerStyle: { backgroundColor: "black" },
                        headerTitleStyle: {
                          fontFamily: "Inter-Regular",
                          fontSize: 18,
                        },
                      }}
                    />
                    <Stack.Screen
                      name="EditProfile"
                      options={{
                        title: "Edit Profile",
                        headerBackTitle: "Back",
                        headerTintColor: "white",
                        headerStyle: { backgroundColor: "black" },
                        headerTitleStyle: {
                          fontFamily: "Inter-Regular",
                          fontSize: 18,
                        },
                      }}
                    />
                    <Stack.Screen
                      name="SettleUp"
                      options={{
                        title: "Settle Up",
                        headerBackTitle: "Back",
                        headerTintColor: "white",
                        headerStyle: { backgroundColor: "black" },
                        headerTitleStyle: {
                          fontFamily: "Inter-Regular",
                          fontSize: 18,
                        },
                      }}
                    />
                    <Stack.Screen
                      name="ExpenseDetails"
                      options={{
                        title: "Expense Details",
                        headerBackTitle: "Back",
                        headerTintColor: "white",
                        headerStyle: { backgroundColor: "black" },
                        headerTitleStyle: {
                          fontFamily: "Inter-Regular",
                          fontSize: 18,
                        },
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
  );
}
