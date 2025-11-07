import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { ShopManager } from '../../types/shop';
import { useManagers } from './managers/hooks/useManagers';
import { ManagerList } from './managers/ManagerList';
import { ManagerFormModal, ManagerFormData } from './managers/ManagerFormModal';

export const ManagersManagement: React.FC = () => {
  const { managers, loading, error, isSubmitting, isDeleting, deleteManager, toggleActive, createManager, updateManager, refetch } = useManagers([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<ShopManager | null>(null);

  // 削除中のマネージャーIDを集める
  const deletingIds = new Set(managers.filter(m => isDeleting(m.id)).map(m => m.id));

  // 初回ロード時にマネージャーを取得
  useEffect(() => {
    refetch();
  }, []);

  const handleCreateManager = () => {
    setEditingManager(null);
    setIsModalOpen(true);
  };

  const handleEditManager = (manager: ShopManager) => {
    setEditingManager(manager);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (formData: ManagerFormData) => {
    try {
      if (editingManager) {
        await updateManager(editingManager.id, formData);
      } else {
        await createManager(formData);
      }
      setIsModalOpen(false);
      setEditingManager(null);
    } catch (err) {
      console.error('Failed to save manager:', err);
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    try {
      await deleteManager(managerId);
    } catch (err) {
      console.error('Failed to delete manager:', err);
    }
  };

  const handleToggleActive = async (managerId: string, isActive: boolean) => {
    try {
      await toggleActive(managerId, isActive);
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">店舗管理者管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗管理者アカウントの作成・編集・削除を行います
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {/* ページタイトル */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">店舗管理者管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗管理者アカウントの作成・編集・削除を行います
          </p>
        </div>
        <Button onClick={handleCreateManager} className="bg-red-600 hover:bg-red-700 text-sm px-3 py-2">
          新規作成
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error?.message || 'エラーが発生しました'}</p>
        </div>
      )}

      {/* マネージャー一覧 */}
      <ManagerList
        managers={managers}
        onDelete={handleDeleteManager}
        onEdit={handleEditManager}
        onToggleActive={handleToggleActive}
        deletingIds={deletingIds}
        isLoading={loading}
      />

      {/* マネージャーフォームモーダル */}
      <ManagerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingManager(null);
        }}
        onSubmit={handleSubmitForm}
        editingManager={editingManager}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
