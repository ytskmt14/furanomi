/**
 * 店舗管理者割り当てステップコンポーネント
 * 店舗管理者を既存から選択または新規作成する
 */

import React from 'react';
import { ShopManagerSection } from '../ShopManagerSection';
import { ShopOnboardingFormData, FormErrors } from '../types';
import { ShopManager } from '@/types/shop';

export interface ShopManagerStepProps {
  /** フォームデータ */
  formData: Pick<
    ShopOnboardingFormData,
    'shop_manager_id' | 'newManagerData' | 'managerMode'
  >;
  /** 利用可能な店舗管理者リスト */
  shopManagers: ShopManager[];
  /** フィールド変更時のコールバック */
  onChange: (field: keyof ShopOnboardingFormData, value: any) => void;
  /** エラーメッセージ */
  errors: FormErrors;
}

/**
 * 店舗管理者割り当てステップコンポーネント
 * 
 * 店舗管理者を既存から選択または新規作成します。
 * 
 * @example
 * ```tsx
 * <ShopManagerStep
 *   formData={formData}
 *   shopManagers={shopManagers}
 *   onChange={handleChange}
 *   errors={errors}
 * />
 * ```
 */
export const ShopManagerStep: React.FC<ShopManagerStepProps> = ({
  formData,
  shopManagers,
  onChange,
  errors,
}) => {
  // マネージャーモード変更
  const handleManagerModeChange = (mode: 'existing' | 'new') => {
    onChange('managerMode', mode);
    // モード変更時に選択状態をリセット
    if (mode === 'existing') {
      onChange('shop_manager_id', '');
    } else {
      onChange('newManagerData', {
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
      });
    }
  };

  // 既存マネージャー選択
  const handleSelectedManagerIdChange = (id: string) => {
    onChange('shop_manager_id', id);
  };

  // 新規マネージャーフォーム変更
  const handleNewManagerChange = (field: string, value: string) => {
    onChange('newManagerData', {
      ...formData.newManagerData,
      [field]: value,
    } as ShopOnboardingFormData['newManagerData']);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          店舗管理者の割り当て
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          店舗を管理する店舗管理者を選択するか、新規作成してください。店舗管理者は必須です。
        </p>
      </div>

      <div className="space-y-4">
        <ShopManagerSection
          shopManagers={shopManagers}
          managerMode={formData.managerMode}
          onManagerModeChange={handleManagerModeChange}
          selectedManagerId={formData.shop_manager_id}
          onSelectedManagerIdChange={handleSelectedManagerIdChange}
          newManagerData={
            formData.newManagerData || {
              username: '',
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              phone: '',
            }
          }
          onNewManagerChange={handleNewManagerChange}
          isEditing={false}
        />

        {/* エラーメッセージ表示 */}
        {errors.shop_manager_id && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.shop_manager_id}</p>
          </div>
        )}

        {/* 新規マネージャーのエラーメッセージ */}
        {formData.managerMode === 'new' && (
          <div className="space-y-2">
            {errors['newManagerData.username'] && (
              <p className="text-sm text-red-500">
                {errors['newManagerData.username']}
              </p>
            )}
            {errors['newManagerData.email'] && (
              <p className="text-sm text-red-500">
                {errors['newManagerData.email']}
              </p>
            )}
            {errors['newManagerData.password'] && (
              <p className="text-sm text-red-500">
                {errors['newManagerData.password']}
              </p>
            )}
            {errors['newManagerData.firstName'] && (
              <p className="text-sm text-red-500">
                {errors['newManagerData.firstName']}
              </p>
            )}
            {errors['newManagerData.lastName'] && (
              <p className="text-sm text-red-500">
                {errors['newManagerData.lastName']}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

