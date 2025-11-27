import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/types';
import { clearTokens, getAccessToken, isAuthenticated as isAuthenticatedUtil } from '../utils/token';
import { authAPI } from '../api/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on initial load
    const checkAuthStatus = async () => {
      if (isAuthenticatedUtil()) {
        try {
          // In a real app, you might want to validate the token or fetch user info
          // For now, we'll just check if the token exists
          const token = getAccessToken();
          if (token) {
            // In a real scenario, you would call an API to get user info
            // For now, we'll leave user as null until login
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success && response.data.data) {
        const { user: userData, accessToken, refreshToken } = response.data.data;
        setUser(userData);
        
        // Save tokens to localStorage
        // We'll need to update the token utility to save the tokens
        localStorage.setItem('yt_todolist_access_token', accessToken);
        localStorage.setItem('yt_todolist_refresh_token', refreshToken);
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearTokens();
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};