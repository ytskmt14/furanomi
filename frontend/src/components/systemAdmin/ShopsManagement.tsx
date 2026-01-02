/**
 * 店舗管理ページ
 * 店舗の登録・編集・削除を管理
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useShops } from './shops/hooks/useShops';
import { ShopListCard } from './shops/ShopListCard';
import { ShopFormModal } from './shops/ShopFormModal';
import { ShopOnboardingFlow } from './shops/ShopOnboardingFlow';
import { ShopFeatureSettingsModal } from './ShopFeatureSettingsModal';
import { Shop } from '@/types/shop';

/**
 * 店舗管理コンポーネント
 *
 * @example
 * ```tsx
 * <ShopsManagement />
 * ```
 */
export const ShopsManagement: React.FC = () => {
  const {
    shops,
    shopManagers,
    isLoading,
    error,
    success,
    featuresMap,
    createShop,
    updateShop,
    deleteShop,
    refetch,
  } = useShops();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [featureSettingsShop, setFeatureSettingsShop] = useState<{ id: string; name: string } | null>(null);

  const FEATURE_LABELS: Record<string, string> = {
    reservation: '予約機能',
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      restaurant: '🍽️',
      cafe: '☕',
      izakaya: '🍺',
    };
    return icons[category] || '🏪';
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      restaurant: 'レストラン',
      cafe: 'カフェ',
      izakaya: '居酒屋',
    };
    return labels[category] || category;
  };

  const handleCreateShop = () => {
    setEditingShop(null);
    setIsOnboardingOpen(true);
  };

  const handleEditShop = (shop: any) => {
    setEditingShop(shop);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShop(null);
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
  };

  const handleOnboardingComplete = async (_shop: Shop) => {
    // 登録完了後のコールバック処理
    await refetch(); // 店舗一覧を更新
    setIsOnboardingOpen(false);
  };

  const handleSubmitForm = async (formData: any, newManagerData: any, managerMode: string) => {
    try {
      if (editingShop) {
        await updateShop(editingShop.id, formData);
      } else {
        await createShop(formData, managerMode === 'new' ? newManagerData : undefined);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save shop:', err);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('この店舗を削除しますか？')) return;

    try {
      await deleteShop(shopId);
    } catch (err) {
      console.error('Failed to delete shop:', err);
    }
  };

  const handleFeatureSettings = (shopId: string, shopName: string) => {
    setFeatureSettingsShop({ id: shopId, name: shopName });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">店舗管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗の登録・編集・削除を行います
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
          <h1 className="text-xl font-bold text-gray-900">店舗管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗の登録・編集・削除を行います
          </p>
        </div>
        <Button onClick={handleCreateShop} className="bg-red-600 hover:bg-red-700 text-sm px-3 py-2">
          新規登録
        </Button>
      </div>

      {/* メッセージ表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* 店舗一覧 */}
      <div className="space-y-3">
        {shops.map((shop) => (
          <ShopListCard
            key={shop.id}
            shop={shop}
            getCategoryIcon={getCategoryIcon}
            getCategoryLabel={getCategoryLabel}
            enabledFeatures={featuresMap[shop.id] || {}}
            featureLabels={FEATURE_LABELS}
            onEdit={handleEditShop}
            onDelete={handleDeleteShop}
            onFeatureSettings={handleFeatureSettings}
          />
        ))}
      </div>

      {/* 店舗登録フローモーダル（新規登録用） */}
      <ShopOnboardingFlow
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
        onComplete={handleOnboardingComplete}
        shopManagers={shopManagers.map(manager => ({
          ...manager,
          created_at: manager.created_at || new Date().toISOString(),
        }))}
      />

      {/* 店舗フォームモーダル（編集用） */}
      <ShopFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
        editingShop={editingShop}
        shopManagers={shopManagers}
      />

      {/* 機能設定モーダル */}
      {featureSettingsShop && (
        <ShopFeatureSettingsModal
          shopId={featureSettingsShop.id}
          shopName={featureSettingsShop.name}
          isOpen={true}
          onClose={() => {
            refetch();
            setFeatureSettingsShop(null);
          }}
        />
      )}
    </div>
  );
};
