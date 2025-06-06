import { FinancialProvider } from "@/contexts/FinancialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text,TouchableOpacity } from "react-native";
import "react-native-reanimated";

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
      <FinancialProvider>
        <GroupsProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="CreateGroup"
              options={{
                headerShown: true,
                title: "Create a Group",
                headerBackTitle: "Cancel",
                headerBackVisible: true,
              }}
            />
            <Stack.Screen name="+not-found" />
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
              name="SignUp"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AddExpense"
              options={{
                headerShown: true,
                title: "Add Expense",
                headerBackVisible: false,
              }}
            />
          </Stack>
        </GroupsProvider>
      </FinancialProvider>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
