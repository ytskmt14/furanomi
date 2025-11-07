/**
 * 連絡先タブコンポーネント
 * 電話番号、メールアドレスなどの連絡先を編集
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ShopFormData } from '../hooks/useShopInfo';

interface ContactTabProps {
  /** フォームデータ */
  formData: ShopFormData;
  /** フォームデータ更新コールバック */
  onFormChange: (updates: Partial<ShopFormData>) => void;
  /** 保存中か */
  isSaving: boolean;
  /** 保存ボタンクリック時のコールバック */
  onSave: () => Promise<void>;
}

/**
 * 連絡先タブコンポーネント
 *
 * @example
 * ```tsx
 * <ContactTab
 *   formData={formData}
 *   onFormChange={handleFormChange}
 *   isSaving={isSaving}
 *   onSave={handleSave}
 * />
 * ```
 */
export const ContactTab: React.FC<ContactTabProps> = ({
  formData,
  onFormChange,
  isSaving,
  onSave,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFormChange({ [name]: value } as Partial<ShopFormData>);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">連絡先情報</h3>
        <p className="text-sm text-gray-600">電話番号、メールアドレスなどの連絡先</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            電話番号
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="03-1234-5678"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            メールアドレス
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="info@example.com"
          />
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end pt-6 pb-6 border-t border-gray-200">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                保存中...
              </div>
            ) : (
              '保存する'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
