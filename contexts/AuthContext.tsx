import { auth } from "@/src/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { router } from "expo-router";

// Define what data and functions our context will provide
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  refreshUser: async () => {},
  updateUserProfile: async () => {},
});

// Provider component that wraps your app and makes auth object available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for authentication state changes when the component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true); // Set loading true when auth state changes
      if(firebaseUser) {
        try{
          const token = await firebaseUser.getIdToken(true);
          await AsyncStorage.setItem('userToken', token);
          setUser(firebaseUser);
        } catch (error) {
          console.error("Error getting ID token:", error);
          await AsyncStorage.removeItem('userToken');
          setUser(null);
        }
      } else {
        await AsyncStorage.removeItem('userToken');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign out
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.reload();
        setUser({ ...currentUser });
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName: string, photoURL: string) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Update Firebase profile
        await updateProfile(currentUser, {
          displayName,
          photoURL
        });
        
        // Update local state without reloading
        setUser({
          ...currentUser,
          displayName,
          photoURL
        });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  // Value to be provided to consuming components
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoading, // Only consider authenticated when not loading
    logout,
    refreshUser,
    updateUserProfile
  };

  // Don't render children while initial auth state is loading
  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);