import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { apiUrl } from '../constants/ApiConfig';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);  
  const [user, setUser] = useState<User | null>(null);    
  const [loading, setLoading] = useState(true);

  const login = async (token: string, userData: User) => {
    setToken(token);
    setUser(userData);
    await AsyncStorage.setItem('token', token);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          
          // Validate the token with your backend
          const response = await fetch(apiUrl('api/auth/validate'), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            console.log("response from validate token", response);
            const userData = await response.json();
            setUser(userData.user);
          } else {
            // Token is invalid, clear it
            console.log("token is invalid, clearing it");
            await logout();
          }
        }
      } catch (error) {
        console.error('Error checking token:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
