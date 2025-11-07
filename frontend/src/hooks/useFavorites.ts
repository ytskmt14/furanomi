/**
 * お気に入り管理のカスタムフック
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

/**
 * useFavorites の戻り値
 */
export interface UseFavoritesReturn {
  favorites: Set<string>;
  isFavorite: (shopId: string) => boolean;
  toggleFavorite: (shopId: string) => Promise<void>;
  loading: boolean;
  isToggling: (shopId: string) => boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * お気に入り管理フック
 *
 * @param isAuthenticated ユーザーが認証済みかどうか
 * @returns お気に入り管理機能
 *
 * @example
 * ```tsx
 * const { isFavorite, toggleFavorite, isToggling } = useFavorites(isAuthenticated);
 *
 * return (
 *   <button
 *     onClick={() => toggleFavorite(shopId)}
 *     disabled={isToggling(shopId)}
 *   >
 *     {isFavorite(shopId) ? '♥️' : '🤍'} お気に入り
 *   </button>
 * );
 * ```
 */
export function useFavorites(isAuthenticated: boolean): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [togglegingIds, setTogglingIds] = useState<Set<string>>(new Set());

  /**
   * お気に入り一覧を取得
   */
  const fetchFavorites = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setFavorites(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getFavorites();
      const favIds = response.favorites || [];
      setFavorites(new Set(favIds));
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('お気に入りの取得に失敗しました');
      setError(error);
      setFavorites(new Set());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 認証状態が変わったときにお気に入りを再取得
   */
  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated, fetchFavorites]);

  /**
   * ショップがお気に入りかどうかチェック
   */
  const isFavorite = useCallback(
    (shopId: string): boolean => {
      return favorites.has(shopId);
    },
    [favorites]
  );

  /**
   * お気に入りを切り替え（楽観的更新）
   */
  const toggleFavorite = useCallback(
    async (shopId: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('ログインが必要です');
      }

      const isCurrent = isFavorite(shopId);
      const previousFavorites = new Set(favorites);

      try {
        // UI を即座に更新（楽観的更新）
        setTogglingIds((prev) => new Set([...prev, shopId]));

        if (isCurrent) {
          // 削除
          const newFavorites = new Set(favorites);
          newFavorites.delete(shopId);
          setFavorites(newFavorites);

          await apiService.removeFavorite(shopId);
        } else {
          // 追加
          const newFavorites = new Set(favorites);
          newFavorites.add(shopId);
          setFavorites(newFavorites);

          await apiService.addFavorite(shopId);
        }

        setError(null);
      } catch (err) {
        // エラー時はロールバック
        setFavorites(previousFavorites);

        const error = err instanceof Error ? err : new Error('操作に失敗しました');
        setError(error);
        throw error;
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(shopId);
          return next;
        });
      }
    },
    [isAuthenticated, favorites, isFavorite]
  );

  /**
   * 指定したショップIDが処理中かどうか
   */
  const isToggling = useCallback(
    (shopId: string): boolean => {
      return togglegingIds.has(shopId);
    },
    [togglegingIds]
  );

  /**
   * お気に入りを再取得
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    loading,
    isToggling,
    error,
    refetch,
  };
}
