/**
 * 店舗管理カスタムフック
 * 店舗の CRUD 操作とデータ管理（React Query版）
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../../../services/api';
import { Shop } from '../../../../types/shop';
import { queryKeys } from '../../../../lib/queryKeys';

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
  isLoading: boolean;
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
 * 店舗管理フック（React Query版）
 *
 * @returns 店舗管理機能
 *
 * @example
 * ```tsx
 * const { shops, createShop, updateShop, deleteShop } = useShops();
 * ```
 */
export function useShops(): UseShopsReturn {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 店舗一覧を取得
  const { data: shopsData = [], isLoading: shopsLoading } = useQuery({
    queryKey: queryKeys.shops.lists(),
    queryFn: async () => {
      const response = await apiService.getShops();
      return response.shops || [];
    },
  });

  // ショップマネージャー一覧を取得
  const { data: managersData = [], isLoading: managersLoading } = useQuery({
    queryKey: queryKeys.managers.lists(),
    queryFn: async () => {
      const response = await apiService.getShopManagers();
      return response;
    },
  });

  const isLoading = shopsLoading || managersLoading;

  // 各店舗の機能設定を取得し、マップを構築
  const featuresMap: Record<string, Record<string, boolean>> = {};
  shopsData.forEach((shop) => {
    // Each shop will individually use useShopFeatures hook if needed
    // For admin list view, we use the cached data from each shop's query
    const cachedFeatures = queryClient.getQueryData(
      queryKeys.shops.features(shop.id)
    );
    if (cachedFeatures) {
      featuresMap[shop.id] = cachedFeatures as Record<string, boolean>;
    }
  });

  // 店舗作成ミューテーション
  const { mutateAsync: createShopMutation } = useMutation({
    mutationFn: async ({
      shopData,
      managerData,
    }: {
      shopData: any;
      managerData?: any;
    }) => {
      if (managerData) {
        await apiService.createShopManager(managerData);
      }
      await apiService.createShop(shopData);
    },
    onSuccess: () => {
      setSuccess('店舗を作成しました');
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.lists() });
    },
    onError: (err: any) => {
      const errorMsg = err instanceof Error ? err.message : '店舗の作成に失敗しました';
      setError(errorMsg);
    },
  });

  // 店舗更新ミューテーション
  const { mutateAsync: updateShopMutation } = useMutation({
    mutationFn: async ({
      shopId,
      shopData,
    }: {
      shopId: string;
      shopData: any;
    }) => {
      await apiService.updateShop(shopId, shopData);
    },
    onSuccess: () => {
      setSuccess('店舗を更新しました');
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.lists() });
    },
    onError: (err: any) => {
      const errorMsg = err instanceof Error ? err.message : '店舗の更新に失敗しました';
      setError(errorMsg);
    },
  });

  // 店舗削除ミューテーション
  const { mutateAsync: deleteShopMutation } = useMutation({
    mutationFn: async (shopId: string) => {
      await apiService.deleteShop(shopId);
    },
    onSuccess: () => {
      setSuccess('店舗を削除しました');
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.lists() });
    },
    onError: (err: any) => {
      const errorMsg = err instanceof Error ? err.message : '店舗の削除に失敗しました';
      setError(errorMsg);
    },
  });

  // ラッパー関数
  const createShop = useCallback(
    async (shopData: any, managerData?: any) => {
      setError(null);
      try {
        await createShopMutation({ shopData, managerData });
      } catch (err) {
        throw err;
      }
    },
    [createShopMutation]
  );

  const updateShop = useCallback(
    async (shopId: string, shopData: any) => {
      setError(null);
      try {
        await updateShopMutation({ shopId, shopData });
      } catch (err) {
        throw err;
      }
    },
    [updateShopMutation]
  );

  const deleteShop = useCallback(
    async (shopId: string) => {
      setError(null);
      try {
        await deleteShopMutation(shopId);
      } catch (err) {
        throw err;
      }
    },
    [deleteShopMutation]
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.shops.lists() }),
      queryClient.refetchQueries({ queryKey: queryKeys.managers.lists() }),
    ]);
  }, [queryClient]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    shops: shopsData,
    shopManagers: managersData,
    isLoading,
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
