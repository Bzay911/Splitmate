import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

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
      // Not authenticated -> go to SignIn
      router.replace('/SignIn');
    } else {
      // Authenticated -> go to protected area
      router.replace('/(protected)/(tabs)');
    }
  }, [isMounted, loading, token]);

  if (!isMounted || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutController />
    </AuthProvider>
  );
}
