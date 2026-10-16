import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { AuthContextType, LoginRequest, UserRegisterRequest } from '../types/auth';
import { User } from '../types/user';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'campusfind_token';
const USER_KEY = 'campusfind_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        } catch {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const tokenResponse = await authService.login(credentials);
      const accessToken = tokenResponse.access_token;
      
      localStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);

      // Fetch user profile immediately with the new token
      const userProfile = await authService.getMe();
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: UserRegisterRequest): Promise<void> => {
    await authService.register(data);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authService.getMe();
      updateUser(freshUser);
    } catch (error) {
      console.error('Failed to refresh user profile', error);
    }
  }, [updateUser]);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
