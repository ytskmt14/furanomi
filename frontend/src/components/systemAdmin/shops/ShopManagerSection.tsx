/**
 * 店舗マネージャーセクションコンポーネント
 * マネージャー選択または新規作成を処理
 */

import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface ShopManagerSectionProps {
  /** 利用可能なマネージャーリスト */
  shopManagers: Array<{ id: string; username: string; email: string; first_name: string; last_name: string }>;
  /** マネージャーモード */
  managerMode: 'existing' | 'new';
  /** マネージャーモード変更コールバック */
  onManagerModeChange: (mode: 'existing' | 'new') => void;
  /** フォームデータのマネージャーID */
  selectedManagerId: string;
  /** マネージャーID変更コールバック */
  onSelectedManagerIdChange: (id: string) => void;
  /** 新規マネージャーフォームデータ */
  newManagerData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  /** 新規マネージャーフォーム変更コールバック */
  onNewManagerChange: (field: string, value: string) => void;
  /** 編集中の店舗（既存の場合はマネージャー変更不可） */
  isEditing?: boolean;
}

/**
 * 店舗マネージャーセクションコンポーネント
 *
 * @example
 * ```tsx
 * <ShopManagerSection
 *   shopManagers={shopManagers}
 *   managerMode={managerMode}
 *   onManagerModeChange={setManagerMode}
 *   selectedManagerId={formData.shop_manager_id}
 *   onSelectedManagerIdChange={(id) => onChange('shop_manager_id', id)}
 *   newManagerData={newManagerData}
 *   onNewManagerChange={handleNewManagerChange}
 *   isEditing={!!editingShop}
 * />
 * ```
 */
export const ShopManagerSection: React.FC<ShopManagerSectionProps> = ({
  shopManagers,
  managerMode,
  onManagerModeChange,
  selectedManagerId,
  onSelectedManagerIdChange,
  newManagerData,
  onNewManagerChange,
  isEditing = false,
}) => {
  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">店舗管理者</h3>

      {/* マネージャーモード選択 */}
      <div className="space-y-3 mb-6">
        <label className="flex items-center">
          <input
            type="radio"
            name="managerMode"
            value="existing"
            checked={managerMode === 'existing'}
            onChange={() => onManagerModeChange('existing')}
            disabled={isEditing}
            className="rounded"
          />
          <span className="ml-2 text-sm text-gray-700">既存のマネージャーを選択</span>
        </label>

        <label className="flex items-center">
          <input
            type="radio"
            name="managerMode"
            value="new"
            checked={managerMode === 'new'}
            onChange={() => onManagerModeChange('new')}
            disabled={isEditing}
            className="rounded"
          />
          <span className="ml-2 text-sm text-gray-700">新しいマネージャーを作成</span>
        </label>

        {isEditing && (
          <p className="text-xs text-gray-500">
            ※ 既存の店舗ではマネージャーの変更はできません
          </p>
        )}
      </div>

      {/* 既存マネージャー選択 */}
      {managerMode === 'existing' && (
        <div>
          <Label htmlFor="shop_manager_id" className="text-sm font-medium text-gray-700">
            マネージャーを選択
          </Label>
          <select
            id="shop_manager_id"
            value={selectedManagerId}
            onChange={(e) => onSelectedManagerIdChange(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- 選択してください --</option>
            {shopManagers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.first_name} {manager.last_name} ({manager.username})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 新規マネージャー作成フォーム */}
      {managerMode === 'new' && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900">新規マネージャー情報</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manager-username" className="text-sm font-medium text-gray-700">
                ユーザー名 *
              </Label>
              <Input
                id="manager-username"
                value={newManagerData.username}
                onChange={(e) => onNewManagerChange('username', e.target.value)}
                className="mt-1"
                placeholder="manager_username"
                required
              />
            </div>

            <div>
              <Label htmlFor="manager-email" className="text-sm font-medium text-gray-700">
                メールアドレス *
              </Label>
              <Input
                id="manager-email"
                type="email"
                value={newManagerData.email}
                onChange={(e) => onNewManagerChange('email', e.target.value)}
                className="mt-1"
                placeholder="manager@example.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="manager-password" className="text-sm font-medium text-gray-700">
              パスワード *
            </Label>
            <Input
              id="manager-password"
              type="password"
              value={newManagerData.password}
              onChange={(e) => onNewManagerChange('password', e.target.value)}
              className="mt-1"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manager-firstName" className="text-sm font-medium text-gray-700">
                名前 *
              </Label>
              <Input
                id="manager-firstName"
                value={newManagerData.firstName}
                onChange={(e) => onNewManagerChange('firstName', e.target.value)}
                className="mt-1"
                placeholder="太郎"
                required
              />
            </div>

            <div>
              <Label htmlFor="manager-lastName" className="text-sm font-medium text-gray-700">
                姓 *
              </Label>
              <Input
                id="manager-lastName"
                value={newManagerData.lastName}
                onChange={(e) => onNewManagerChange('lastName', e.target.value)}
                className="mt-1"
                placeholder="山田"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="manager-phone" className="text-sm font-medium text-gray-700">
              電話番号
            </Label>
            <Input
              id="manager-phone"
              value={newManagerData.phone}
              onChange={(e) => onNewManagerChange('phone', e.target.value)}
              className="mt-1"
              placeholder="090-1234-5678"
            />
          </div>
        </div>
      )}
    </div>
  );
};
