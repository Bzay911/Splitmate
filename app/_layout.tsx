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
import { Text, TouchableOpacity } from "react-native";
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
              // headerRight: () => (
              //   <TouchableOpacity
              //     onPress={() => {
              //       // Handle create action here
              //       console.log("Create pressed");
              //     }}
              //     style={{ marginRight: 16 }}
              //   >
              //     <Text
              //       style={{
              //         color: "#007AFF", // iOS blue color
              //         fontSize: 16,
              //         fontWeight: "600",
              //       }}
              //     >
              //       Create
              //     </Text>
              //   </TouchableOpacity>
              // ),
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GroupsProvider>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
