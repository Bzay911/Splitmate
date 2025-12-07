import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

function LayoutController() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before navigation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || loading) return; // Wait for mount and auth to load

    if (!token) {
      router.replace("/SignIn");
    } else {
      router.replace("/(protected)/(tabs)");
    }
  }, [isMounted, loading, token]);

  if (!isMounted || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f5f5f5"
        translucent={false}
      />
      <LayoutController />
    </AuthProvider>
  );
}
