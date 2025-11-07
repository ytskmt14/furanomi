/**
 * マネージャーカード - 個別マネージャー情報表示
 */

import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { ShopManager } from '../../../types/shop';

interface ManagerCardProps {
  /** マネージャー情報 */
  manager: ShopManager;
  /** 削除ボタンクリック時のコールバック */
  onDelete: (managerId: string) => Promise<void>;
  /** 編集ボタンクリック時のコールバック */
  onEdit: (manager: ShopManager) => void;
  /** アクティブ状態切り替え時のコールバック */
  onToggleActive: (managerId: string, isActive: boolean) => Promise<void>;
  /** 削除中の状態 */
  isDeleting?: boolean;
  /** ローディング中の状態 */
  isLoading?: boolean;
}

/**
 * マネージャーカードコンポーネント
 *
 * @example
 * ```tsx
 * <ManagerCard
 *   manager={manager}
 *   onDelete={handleDelete}
 *   onEdit={handleEdit}
 *   onToggleActive={handleToggleActive}
 *   isDeleting={isDeleting('manager-1')}
 * />
 * ```
 */
export const ManagerCard: React.FC<ManagerCardProps> = ({
  manager,
  onDelete,
  onEdit,
  onToggleActive,
  isDeleting = false,
  isLoading = false,
}) => {
  const handleDelete = async () => {
    try {
      await onDelete(manager.id);
    } catch (error) {
      console.error('Failed to delete manager:', error);
    }
  };

  const handleToggleActive = async () => {
    try {
      await onToggleActive(manager.id, manager.is_active || false);
    } catch (error) {
      console.error('Failed to toggle manager status:', error);
    }
  };

  const fullName = `${manager.first_name || ''} ${manager.last_name || ''}`.trim();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{fullName || manager.username}</h3>
            <p className="text-sm text-gray-600 mt-1">@{manager.username}</p>
          </div>

          {/* ステータスバッジ */}
          <div className="ml-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                manager.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {manager.is_active ? 'アクティブ' : '非アクティブ'}
            </span>
          </div>
        </div>

        {/* 連絡先情報 */}
        <div className="space-y-2 mb-6">
          {manager.email && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 w-20">メール:</span>
              <a href={`mailto:${manager.email}`} className="text-blue-600 hover:underline">
                {manager.email}
              </a>
            </div>
          )}

          {manager.phone && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 w-20">電話:</span>
              <a href={`tel:${manager.phone}`} className="text-blue-600 hover:underline">
                {manager.phone}
              </a>
            </div>
          )}
        </div>

        {/* アクション */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(manager)}
            disabled={isLoading}
            className="flex-1"
          >
            編集
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
            disabled={isLoading || isDeleting}
            className="flex-1"
          >
            {manager.is_active ? '無効化' : '有効化'}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading || isDeleting}
            className="flex-1"
          >
            {isDeleting ? '削除中...' : '削除'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
