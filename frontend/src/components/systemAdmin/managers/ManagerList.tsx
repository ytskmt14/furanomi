/**
 * マネージャー一覧表示コンポーネント
 * 複数のマネージャーカードをグリッド表示
 */

import React from 'react';
import { ShopManager } from '../../../types/shop';
import { ManagerCard } from './ManagerCard';

interface ManagerListProps {
  /** マネージャーの配列 */
  managers: ShopManager[];
  /** 削除ボタンクリック時のコールバック */
  onDelete: (managerId: string) => Promise<void>;
  /** 編集ボタンクリック時のコールバック */
  onEdit: (manager: ShopManager) => void;
  /** アクティブ状態切り替え時のコールバック */
  onToggleActive: (managerId: string, isActive: boolean) => Promise<void>;
  /** 削除中のマネージャーID */
  deletingIds: Set<string>;
  /** ローディング中か */
  isLoading?: boolean;
}

/**
 * マネージャー一覧コンポーネント
 *
 * @example
 * ```tsx
 * <ManagerList
 *   managers={managers}
 *   onDelete={handleDelete}
 *   onEdit={handleEdit}
 *   onToggleActive={handleToggleActive}
 *   deletingIds={deletingIds}
 *   isLoading={isLoading}
 * />
 * ```
 */
export const ManagerList: React.FC<ManagerListProps> = ({
  managers,
  onDelete,
  onEdit,
  onToggleActive,
  deletingIds,
  isLoading = false,
}) => {
  // 空状態の表示
  if (managers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 text-sm">マネージャーが登録されていません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {managers.map((manager) => (
        <ManagerCard
          key={manager.id}
          manager={manager}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          isDeleting={deletingIds.has(manager.id)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
