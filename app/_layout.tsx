import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
 
export default function Root(){
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator(){
  const { isAuthenticated, isLoading } = useAuth();

  console.log('isLoading', isLoading);
  console.log('isAuthenticated', isAuthenticated);

  return(
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated} >
        <Stack.Screen name="(protected)/(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}