/**
 * 店舗フィーチャー（機能）を取得・キャッシュするカスタムフック
 * React Queryを使用した実装
 */

import { useQuery, type QueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import { CACHE_TTL } from '../constants/ui';

/**
 * useShopFeatures の戻り値
 */
export interface UseShopFeaturesReturn {
  features: Record<string, boolean> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isEnabled: (featureName: string) => boolean;
}

/**
 * 店舗フィーチャーを取得するフック（React Query版）
 *
 * @param shopId 店舗ID
 * @returns フィーチャー情報と制御メソッド
 *
 * @example
 * ```tsx
 * const { features, isLoading, error, isEnabled } = useShopFeatures(shopId);
 *
 * if (isLoading) return <div>読み込み中...</div>;
 * if (error) return <div>エラー: {error.message}</div>;
 *
 * return (
 *   <>
 *     {isEnabled('reservation') && <ReservationButton shopId={shopId} />}
 *   </>
 * );
 * ```
 */
export function useShopFeatures(shopId: string): UseShopFeaturesReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.shops.features(shopId),
    queryFn: async () => {
      const response = await apiService.getShopFeatures(shopId);
      return response.features || {};
    },
    staleTime: CACHE_TTL.SHOP_FEATURES || 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  /**
   * 指定されたフィーチャーが有効か確認
   */
  const isEnabled = (featureName: string): boolean => {
    return data?.[featureName] ?? false;
  };

  /**
   * フィーチャーを再取得
   */
  const handleRefetch = async (): Promise<void> => {
    await refetch();
  };

  return {
    features: data || null,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch: handleRefetch,
    isEnabled,
  };
}

/**
 * 全フィーチャーキャッシュをクリア
 * （ユーザーがログアウトしたときなど）
 */
export function clearFeatureCache(queryClient?: QueryClient): void {
  if (queryClient) {
    queryClient.removeQueries({ queryKey: queryKeys.shops.all });
  }
}

/**
 * 特定の店舗のキャッシュをクリア
 */
export function clearShopFeatureCache(shopId: string, queryClient?: QueryClient): void {
  if (queryClient) {
    queryClient.removeQueries({
      queryKey: queryKeys.shops.features(shopId),
    });
  }
}
