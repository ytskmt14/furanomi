/**
 * 基本情報タブコンポーネント
 * 店舗名、説明、住所、カテゴリ、画像を編集
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { FileUpload } from '../../ui/file-upload';
import { Switch } from '../../ui/switch';
import { Wine, Coffee, Utensils, ChevronDown } from 'lucide-react';
import { ShopFormData } from '../hooks/useShopInfo';

interface BasicInfoTabProps {
  /** フォームデータ */
  formData: ShopFormData;
  /** フォームデータ更新コールバック */
  onFormChange: (updates: Partial<ShopFormData>) => void;
  /** 画像変更コールバック */
  onImageChange: (dataUrl: string) => void;
  /** 保存中か */
  isSaving: boolean;
  /** 保存ボタンクリック時のコールバック */
  onSave: () => Promise<void>;
  /** 店舗が公開中か */
  isActive?: boolean;
}

/**
 * 基本情報タブコンポーネント
 *
 * @example
 * ```tsx
 * <BasicInfoTab
 *   formData={formData}
 *   onFormChange={handleFormChange}
 *   onImageChange={handleImageChange}
 *   isSaving={isSaving}
 *   onSave={handleSave}
 *   isActive={isActive}
 * />
 * ```
 */
export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  onFormChange,
  onImageChange,
  isSaving,
  onSave,
  isActive = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFormChange({ [name]: value } as Partial<ShopFormData>);
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) return;

    // 画像を圧縮してから呼び出し
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onImageChange(compressedDataUrl);
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">基本情報</h3>
        <p className="text-sm text-gray-600">店舗名、説明、カテゴリなどの基本情報</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            店舗名 *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="店舗名を入力"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            店舗説明
          </Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="店舗の説明を入力"
          />
        </div>

        <div>
          <Label htmlFor="address" className="text-sm font-medium text-gray-700">
            住所 *
          </Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="住所を入力"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium text-gray-700">
            カテゴリ *
          </Label>
          <div className="mt-1 relative">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="block w-full border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="izakaya">居酒屋</option>
              <option value="cafe">カフェ</option>
              <option value="restaurant">レストラン</option>
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {formData.category === 'izakaya' && <Wine className="w-4 h-4 text-gray-500" />}
              {formData.category === 'cafe' && <Coffee className="w-4 h-4 text-gray-500" />}
              {formData.category === 'restaurant' && <Utensils className="w-4 h-4 text-gray-500" />}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">
            店舗画像
          </Label>
          <div className="mt-1">
            <FileUpload
              onFileSelect={handleImageSelect}
              preview={formData.image_url}
              maxSize={5 * 1024 * 1024}
              acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between py-4 border-t border-gray-200">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                利用者アプリへの公開
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                {isActive
                  ? '一度公開した店舗は非公開に変更できません。システム管理者にお問い合わせください。'
                  : '必要な情報を設定したら、こちらを有効にすることで利用者アプリに公開されます。'}
              </p>
            </div>
            <Switch
              checked={formData.is_active || false}
              onCheckedChange={(checked) => {
                onFormChange({ is_active: checked });
              }}
              disabled={isActive === true}
            />
          </div>
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
