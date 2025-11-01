import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期ロード時にユーザー情報を取得
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await apiService.getCurrentUserAuth();
      setUser(response.user);
    } catch (error) {
      // 未ログイン（401）は正常系として扱う：エラーを出さずに匿名として続行
      const message = (error as any)?.message || '';
      const isUnauthenticated = message.includes('Authentication required') || 
                                message.includes('401') || 
                                message.includes('Invalid token') ||
                                message.includes('404');
      if (!isUnauthenticated) {
        console.warn('Failed to load user:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const login = async (email: string, password: string) => {
    await apiService.loginUser(email, password);
    await loadUser();
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    await apiService.registerUser({ email, password, name, phone });
    await loadUser();
  };

  const logout = async () => {
    try {
      await apiService.logoutUser();
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
