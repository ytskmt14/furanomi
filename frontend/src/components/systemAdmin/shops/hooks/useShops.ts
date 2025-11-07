/**
 * 店舗管理カスタムフック
 * 店舗の CRUD 操作とデータ管理
 */

import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../../../../services/api';
import { Shop } from '../../../../types/shop';

interface ShopManager {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  shop_name?: string;
}

/**
 * useShops の戻り値
 */
export interface UseShopsReturn {
  shops: Shop[];
  shopManagers: ShopManager[];
  loading: boolean;
  error: string | null;
  success: string | null;
  featuresMap: Record<string, Record<string, boolean>>;
  createShop: (shopData: any, managerData?: any) => Promise<void>;
  updateShop: (shopId: string, shopData: any) => Promise<void>;
  deleteShop: (shopId: string) => Promise<void>;
  refetch: () => Promise<void>;
  clearMessages: () => void;
}

/**
 * 店舗管理フック
 *
 * @returns 店舗管理機能
 *
 * @example
 * ```tsx
 * const { shops, createShop, updateShop, deleteShop } = useShops();
 * ```
 */
export function useShops(): UseShopsReturn {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopManagers, setShopManagers] = useState<ShopManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [featuresMap, setFeaturesMap] = useState<Record<string, Record<string, boolean>>>({});

  /**
   * 店舗とマネージャー、機能設定を取得
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [shopsData, managersData] = await Promise.all([
        apiService.getShops(),
        apiService.getShopManagers(),
      ]);

      setShops(shopsData.shops || []);
      setShopManagers(managersData);

      // 各店舗の機能設定を並列取得
      try {
        const results = await Promise.all(
          (shopsData.shops || []).map(async (shop: Shop) => {
            try {
              const res = await apiService.getShopFeatures(shop.id);
              return [shop.id, res.features || {}] as const;
            } catch {
              return [shop.id, {}] as const;
            }
          })
        );

        const map: Record<string, Record<string, boolean>> = {};
        results.forEach(([id, features]) => {
          map[id] = features;
        });
        setFeaturesMap(map);
      } catch (e) {
        console.warn('Failed to load features for shops', e);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'データの取得に失敗しました';
      setError(errorMsg);
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 店舗を作成
   */
  const createShop = useCallback(
    async (shopData: any, managerData?: any) => {
      setError(null);

      try {
        // 新しいマネージャーが必要な場合は先に作成
        if (managerData) {
          await apiService.createShopManager(managerData);
        }

        // 店舗を作成
        await apiService.createShop(shopData);
        setSuccess('店舗を作成しました');

        // データを再取得
        await refetch();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '店舗の作成に失敗しました';
        setError(errorMsg);
        throw err;
      }
    },
    [refetch]
  );

  /**
   * 店舗を更新
   */
  const updateShop = useCallback(
    async (shopId: string, shopData: any) => {
      setError(null);

      try {
        await apiService.updateShop(shopId, shopData);
        setSuccess('店舗を更新しました');

        // データを再取得
        await refetch();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '店舗の更新に失敗しました';
        setError(errorMsg);
        throw err;
      }
    },
    [refetch]
  );

  /**
   * 店舗を削除
   */
  const deleteShop = useCallback(
    async (shopId: string) => {
      setError(null);

      try {
        await apiService.deleteShop(shopId);
        setSuccess('店舗を削除しました');

        // データを再取得
        await refetch();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '店舗の削除に失敗しました';
        setError(errorMsg);
        throw err;
      }
    },
    [refetch]
  );

  /**
   * メッセージをクリア
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // 初回ロード時にデータを取得
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    shops,
    shopManagers,
    loading,
    error,
    success,
    featuresMap,
    createShop,
    updateShop,
    deleteShop,
    refetch,
    clearMessages,
  };
}
