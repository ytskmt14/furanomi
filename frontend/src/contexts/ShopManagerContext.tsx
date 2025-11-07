/**
 * 店舗マネージャー管理用 Context
 *
 * ShopsManagement と ManagersManagement 間でマネージャー情報を共有し、
 * props drilling を排除します。
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '../services/api';
import { ShopManager } from '../types/shop';

/**
 * ShopManagerContext の型定義
 */
export interface ShopManagerContextType {
  managers: ShopManager[];
  loading: boolean;
  error: Error | null;
  refreshManagers: () => Promise<void>;
  getAvailableManagers: () => ShopManager[];
}

const ShopManagerContext = createContext<ShopManagerContextType | undefined>(undefined);

/**
 * ShopManagerContext を使用するフック
 *
 * @throws Error - Provider の外で使用された場合
 * @returns ShopManagerContext の値
 *
 * @example
 * ```tsx
 * const { managers, loading } = useShopManagers();
 * ```
 */
export const useShopManagers = (): ShopManagerContextType => {
  const context = useContext(ShopManagerContext);
  if (!context) {
    throw new Error('useShopManagers must be used within ShopManagerProvider');
  }
  return context;
};

/**
 * ShopManagerContext のプロバイダーコンポーネント
 *
 * @param children - 子要素
 *
 * @example
 * ```tsx
 * <ShopManagerProvider>
 *   <SystemAdminApp />
 * </ShopManagerProvider>
 * ```
 */
export const ShopManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [managers, setManagers] = useState<ShopManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * マネージャー一覧を取得
   */
  const fetchManagers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // バックエンドに getShopManagers エンドポイントがない場合、
      // 別の方法でマネージャーを取得します。
      // ここでは簡略化のためプレースホルダーを使用します。
      const response = await apiService.verifyToken();

      if (response.valid && response.user) {
        // ユーザー情報から店舗マネージャーを抽出
        // 実装はバックエンド仕様に合わせて調整してください
        setManagers([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('マネージャーの取得に失敗しました');
      setError(error);
      console.error('Failed to fetch managers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * コンポーネントマウント時にマネージャーを取得
   */
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  /**
   * アサイン されていない（店舗を持たない）マネージャーを取得
   */
  const getAvailableManagers = useCallback((): ShopManager[] => {
    return managers.filter((manager) => !('shop_name' in manager) || manager.shop_name === undefined);
  }, [managers]);

  const value: ShopManagerContextType = {
    managers,
    loading,
    error,
    refreshManagers: fetchManagers,
    getAvailableManagers,
  };

  return (
    <ShopManagerContext.Provider value={value}>
      {children}
    </ShopManagerContext.Provider>
  );
};
