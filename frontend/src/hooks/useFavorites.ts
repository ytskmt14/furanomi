/**
 * お気に入り管理のカスタムフック
 * React Queryを使用した実装
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { queryKeys } from '../lib/queryKeys';

/**
 * useFavorites の戻り値
 */
export interface UseFavoritesReturn {
  favorites: Set<string>;
  isFavorite: (shopId: string) => boolean;
  toggleFavorite: (shopId: string) => Promise<void>;
  isLoading: boolean;
  isToggling: (shopId: string) => boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * お気に入り管理フック（React Query版）
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
  const queryClient = useQueryClient();

  // お気に入り一覧を取得
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.favorites.lists(),
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await apiService.getFavorites();
      return response.favorites || [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5分
  });

  // お気に入り追加・削除ミューテーション
  const { mutate: mutateFavorite, isPending } = useMutation({
    mutationFn: async ({
      shopId,
      isCurrentlyFavorite,
    }: {
      shopId: string;
      isCurrentlyFavorite: boolean;
    }) => {
      if (isCurrentlyFavorite) {
        await apiService.removeFavorite(shopId);
      } else {
        await apiService.addFavorite(shopId);
      }
    },
    onMutate: async ({ shopId, isCurrentlyFavorite }) => {
      // ミューテーション開始前にキャッシュをキャンセル
      await queryClient.cancelQueries({
        queryKey: queryKeys.favorites.lists(),
      });

      // 前のデータを保存
      const previousFavorites = queryClient.getQueryData<string[]>(
        queryKeys.favorites.lists()
      ) || [];

      // 楽観的更新
      queryClient.setQueryData(
        queryKeys.favorites.lists(),
        (old: string[] = []) => {
          if (isCurrentlyFavorite) {
            return old.filter((id) => id !== shopId);
          } else {
            return [...old, shopId];
          }
        }
      );

      return { previousFavorites };
    },
    onError: (_err, _variables, context) => {
      // エラー時はロールバック
      if (context?.previousFavorites) {
        queryClient.setQueryData(
          queryKeys.favorites.lists(),
          context.previousFavorites
        );
      }
    },
    onSuccess: () => {
      // 成功後はキャッシュを再度取得
      queryClient.invalidateQueries({
        queryKey: queryKeys.favorites.lists(),
      });
    },
  });

  /**
   * ショップがお気に入りかどうかチェック
   */
  const isFavorite = useCallback(
    (shopId: string): boolean => {
      return data.includes(shopId);
    },
    [data]
  );

  /**
   * お気に入りを切り替え
   */
  const toggleFavorite = useCallback(
    async (shopId: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('ログインが必要です');
      }

      mutateFavorite(
        {
          shopId,
          isCurrentlyFavorite: isFavorite(shopId),
        },
        {
          onError: (err: any) => {
            const error = err instanceof Error ? err : new Error('操作に失敗しました');
            throw error;
          },
        }
      );
    },
    [isAuthenticated, isFavorite, mutateFavorite]
  );

  /**
   * 指定したショップIDが処理中かどうか
   */
  const isToggling = useCallback(
    (_shopId: string): boolean => {
      return isPending;
    },
    [isPending]
  );

  /**
   * お気に入りを再取得
   */
  const handleRefetch = async (): Promise<void> => {
    await refetch();
  };

  return {
    favorites: new Set(data),
    isFavorite,
    toggleFavorite,
    isLoading,
    isToggling,
    error: error instanceof Error ? error : null,
    refetch: handleRefetch,
  };
}
