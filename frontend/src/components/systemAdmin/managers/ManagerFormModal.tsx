/**
 * マネージャー編集フォームモーダル
 * マネージャーの作成・編集を行うモーダルダイアログ
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { ShopManager } from '../../../types/shop';
import { FormField } from '../../common/forms/FormField';

interface ManagerFormModalProps {
  /** モーダルが開いているか */
  isOpen: boolean;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
  /** フォーム送信時のコールバック */
  onSubmit: (data: ManagerFormData) => Promise<void>;
  /** 編集対象のマネージャー（nullの場合は新規作成） */
  editingManager?: ShopManager | null;
  /** 送信中か */
  isSubmitting?: boolean;
}

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
 * マネージャーフォームモーダルコンポーネント
 *
 * @example
 * ```tsx
 * <ManagerFormModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onSubmit={handleSubmit}
 *   editingManager={editingManager}
 *   isSubmitting={isSubmitting}
 * />
 * ```
 */
export const ManagerFormModal: React.FC<ManagerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingManager = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<ManagerFormData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ManagerFormData, string>>>({});

  // 編集マネージャー変更時にフォームを初期化
  useEffect(() => {
    if (editingManager) {
      setFormData({
        username: editingManager.username,
        email: editingManager.email,
        password: '', // 編集時はパスワードを空にする
        firstName: editingManager.first_name,
        lastName: editingManager.last_name,
        phone: editingManager.phone || '',
        is_active: editingManager.is_active,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [editingManager, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ManagerFormData, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名は必須です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!editingManager && !formData.password) {
      newErrors.password = 'パスワードは必須です（新規作成時）';
    } else if (editingManager && formData.password && formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上である必要があります';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = '名前は必須です';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = '姓は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: keyof ManagerFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white rounded-t-lg md:rounded-lg w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingManager ? '店舗管理者編集' : '新規店舗管理者作成'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="ユーザー名"
                name="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={errors.username}
                required
              />
              <FormField
                label="メールアドレス"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                required
              />
            </div>

            <FormField
              label={editingManager ? 'パスワード (変更する場合のみ)' : 'パスワード'}
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              required={!editingManager}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="名前"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={errors.firstName}
                required
              />
              <FormField
                label="姓"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <FormField
              label="電話番号"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700 font-medium cursor-pointer">
                アカウントを有効にする
              </label>
            </div>

            {/* ボタン */}
            <div className="flex flex-col space-y-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
