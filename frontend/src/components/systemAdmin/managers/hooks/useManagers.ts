/**
 * 店舗マネージャーの CRUD 操作を管理するカスタムフック
 */

import { useState, useCallback } from 'react';
import { apiService } from '../../../../services/api';
import { ShopManager } from '../../../../types/shop';

export interface ManagerFormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  is_active: boolean;
}

/**
 * useManagers の戻り値
 */
export interface UseManagersReturn {
  managers: ShopManager[];
  loading: boolean;
  error: Error | null;
  isDeleting: (managerId: string) => boolean;
  isSubmitting: boolean;
  deleteManager: (managerId: string) => Promise<void>;
  toggleActive: (managerId: string, isActive: boolean) => Promise<void>;
  createManager: (data: ManagerFormData) => Promise<void>;
  updateManager: (managerId: string, data: ManagerFormData) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * マネージャーの CRUD 操作を管理するフック
 *
 * @param initialManagers - 初期マネージャーリスト
 * @returns マネージャー管理機能
 *
 * @example
 * ```tsx
 * const { managers, deleteManager, toggleActive } = useManagers(managers);
 * ```
 */
export function useManagers(initialManagers: ShopManager[] = []): UseManagersReturn {
  const [managers, setManagers] = useState<ShopManager[]>(initialManagers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  /**
   * マネージャーを削除
   */
  const deleteManager = useCallback(
    async (managerId: string): Promise<void> => {
      if (!confirm('このマネージャーを削除しますか？')) return;

      setDeletingIds((prev) => new Set([...prev, managerId]));
      setError(null);

      try {
        // API呼び出しはバックエンド仕様に合わせて調整してください
        // await apiService.deleteShopManager(managerId);

        // ローカル状態を更新
        setManagers((prev) => prev.filter((m) => m.id !== managerId));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('マネージャーの削除に失敗しました');
        setError(error);
        throw error;
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(managerId);
          return next;
        });
      }
    },
    []
  );

  /**
   * マネージャーのアクティブ状態を切り替え
   */
  const toggleActive = useCallback(
    async (managerId: string, isActive: boolean): Promise<void> => {
      setError(null);

      try {
        // API呼び出しはバックエンド仕様に合わせて調整してください
        // await apiService.updateShopManager(managerId, { is_active: !isActive });

        // ローカル状態を更新
        setManagers((prev) =>
          prev.map((m) =>
            m.id === managerId ? { ...m, is_active: !isActive } : m
          )
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('ステータスの更新に失敗しました');
        setError(error);
        throw error;
      }
    },
    []
  );

  /**
   * 指定したマネージャーが削除中か確認
   */
  const isDeleting = useCallback(
    (managerId: string): boolean => {
      return deletingIds.has(managerId);
    },
    [deletingIds]
  );

  /**
   * マネージャーリストを再取得
   */
  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getShopManagers();
      setManagers(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('マネージャーの取得に失敗しました');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * マネージャーを新規作成
   */
  const createManager = useCallback(
    async (data: ManagerFormData): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        await apiService.createShopManager({
          username: data.username,
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || null,
          is_active: data.is_active,
        });

        // データを再取得
        await refetch();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('マネージャーの作成に失敗しました');
        setError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  /**
   * マネージャーを更新
   */
  const updateManager = useCallback(
    async (managerId: string, data: ManagerFormData): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        // パスワードが空の場合は除外
        const updateData = {
          username: data.username,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || null,
          is_active: data.is_active,
        } as any;

        if (data.password) {
          updateData.password = data.password;
        }

        await apiService.updateShopManager(managerId, updateData);

        // データを再取得
        await refetch();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('マネージャーの更新に失敗しました');
        setError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    managers,
    loading,
    error,
    isSubmitting,
    isDeleting,
    deleteManager,
    toggleActive,
    createManager,
    updateManager,
    refetch,
  };
}
