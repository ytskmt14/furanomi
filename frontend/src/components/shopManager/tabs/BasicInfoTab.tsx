/**
 * 基本情報タブコンポーネント
 * 店舗名、説明、住所、カテゴリ、画像を編集
 */

import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { FileUpload } from '../../ui/file-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Wine, Coffee, Utensils } from 'lucide-react';
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
 * />
 * ```
 */
export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  onFormChange,
  onImageChange,
  isSaving,
  onSave,
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
          <Label htmlFor="category" className="text-sm font-medium text-gray-700">
            カテゴリ *
          </Label>
          <div className="mt-1">
            <Select
              value={formData.category}
              onValueChange={(value) => onFormChange({ category: value as any })}
            >
              <SelectTrigger className="relative pl-10">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center">
                  {formData.category === 'izakaya' && <Wine className="w-4 h-4 text-gray-500" />}
                  {formData.category === 'cafe' && <Coffee className="w-4 h-4 text-gray-500" />}
                  {formData.category === 'restaurant' && <Utensils className="w-4 h-4 text-gray-500" />}
                </div>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="izakaya">居酒屋</SelectItem>
                <SelectItem value="cafe">カフェ</SelectItem>
                <SelectItem value="restaurant">レストラン</SelectItem>
              </SelectContent>
            </Select>
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
