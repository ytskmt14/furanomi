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
    } catch (error: any) {
      // 未ログイン（401, 404）は正常系として扱う：エラーを出さずに匿名として続行
      // status codeで直接判定（文字列マッチングより堅牢）
      const status = error?.status;
      const isUnauthenticated = status === 401 || status === 404;

      if (!isUnauthenticated) {
        // 401/404以外のエラー（ネットワークエラーなど）はログに出すが、アプリは継続
        console.warn('Failed to load user (non-auth error):', {
          error,
          status,
          message: error?.message
        });
      }

      // いずれの場合もユーザーをnullに設定（未認証として扱う）
      setUser(null);
    } finally {
      // 必ずloadingを解除（これがないとアプリが起動しない）
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
