/**
 * 店舗フィーチャー（機能）を取得・キャッシュするカスタムフック
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { CACHE_TTL } from '../constants/ui';

/**
 * キャッシュされたフィーチャー情報
 */
interface CachedFeatures {
  features: Record<string, boolean>;
  timestamp: number;
}

/**
 * useShopFeatures の戻り値
 */
export interface UseShopFeaturesReturn {
  features: Record<string, boolean> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isEnabled: (featureName: string) => boolean;
}

/**
 * グローバルフィーチャーキャッシュ（複数コンポーネント間での共有）
 */
const globalFeatureCache = new Map<string, CachedFeatures>();

/**
 * 店舗フィーチャーを取得するフック
 *
 * @param shopId 店舗ID
 * @param ttl キャッシュTTL（ミリ秒）
 * @returns フィーチャー情報と制御メソッド
 *
 * @example
 * ```tsx
 * const { features, loading, error } = useShopFeatures(shopId);
 *
 * if (loading) return <div>読み込み中...</div>;
 * if (error) return <div>エラー: {error.message}</div>;
 *
 * return (
 *   <>
 *     {features?.reservation && <ReservationButton shopId={shopId} />}
 *   </>
 * );
 * ```
 */
export function useShopFeatures(
  shopId: string,
  ttl: number = CACHE_TTL.SHOP_FEATURES
): UseShopFeaturesReturn {
  const [features, setFeatures] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheKeyRef = useRef(`features:${shopId}`);

  /**
   * キャッシュが有効か確認
   */
  const isCacheValid = useCallback((cacheKey: string, cacheTTL: number): boolean => {
    const cached = globalFeatureCache.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    return now - cached.timestamp < cacheTTL;
  }, []);

  /**
   * フィーチャーを取得
   */
  const fetchFeatures = useCallback(async (): Promise<void> => {
    const cacheKey = cacheKeyRef.current;

    // キャッシュがあれば使用
    if (isCacheValid(cacheKey, ttl)) {
      const cached = globalFeatureCache.get(cacheKey);
      if (cached) {
        setFeatures(cached.features);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getShopFeatures(shopId);
      const featureData = response.features || {};

      // キャッシュに保存
      globalFeatureCache.set(cacheKey, {
        features: featureData,
        timestamp: Date.now(),
      });

      setFeatures(featureData);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('フィーチャーの取得に失敗しました');
      setError(error);
      setFeatures(null);
    } finally {
      setLoading(false);
    }
  }, [shopId, ttl, isCacheValid]);

  /**
   * コンポーネントマウント時にフィーチャーを取得
   */
  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  /**
   * 指定されたフィーチャーが有効か確認
   */
  const isEnabled = useCallback(
    (featureName: string): boolean => {
      return features?.[featureName] ?? false;
    },
    [features]
  );

  /**
   * フィーチャーを再取得（キャッシュをクリア）
   */
  const refetch = useCallback(async (): Promise<void> => {
    const cacheKey = cacheKeyRef.current;
    // キャッシュをクリア
    globalFeatureCache.delete(cacheKey);
    // 再取得
    await fetchFeatures();
  }, [fetchFeatures]);

  return {
    features,
    loading,
    error,
    refetch,
    isEnabled,
  };
}

/**
 * 全フィーチャーキャッシュをクリア
 * （ユーザーがログアウトしたときなど）
 */
export function clearFeatureCache(): void {
  globalFeatureCache.clear();
}

/**
 * 特定の店舗のキャッシュをクリア
 */
export function clearShopFeatureCache(shopId: string): void {
  const cacheKey = `features:${shopId}`;
  globalFeatureCache.delete(cacheKey);
}
