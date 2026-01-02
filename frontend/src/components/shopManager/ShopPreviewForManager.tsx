/**
 * 店舗管理者向けプレビューコンポーネント
 * 利用者アプリでの店舗表示をプレビューする
 */

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { ShopCategoryBadge } from '../shop/ShopCategoryBadge';
import { LazyImage } from '../LazyImage';
import { AvailabilityBadge } from '../shop/AvailabilityBadge';
import { AddressWithMapLink } from '../shop/AddressWithMapLink';
import { ShopFormData } from './hooks/useShopInfo';

export interface ShopPreviewForManagerProps {
  /** フォームデータ */
  formData: ShopFormData;
}

/**
 * 店舗管理者向けプレビューコンポーネント
 * 
 * 利用者アプリでの店舗表示をプレビューします。
 * 
 * @example
 * ```tsx
 * <ShopPreviewForManager formData={formData} />
 * ```
 */
export const ShopPreviewForManager: React.FC<ShopPreviewForManagerProps> = ({ formData }) => {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-2 border-blue-200">
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900">
            利用者アプリでの表示プレビュー
          </h3>
          <p className="text-xs text-blue-700 mt-1">
            公開前でもプレビューで表示を確認できます
          </p>
        </div>

        {/* 店舗画像 */}
        <div className="relative h-64 w-full overflow-hidden bg-gray-50">
          <LazyImage
            src={
              formData.image_url ||
              `https://via.placeholder.com/400x300?text=${encodeURIComponent(
                formData.name || '店舗名'
              )}`
            }
            alt={formData.name || '店舗名'}
            className="w-full h-full object-cover"
          />

          {/* 空き状況バッジ（左上） */}
          <div className="absolute top-4 left-4 z-10">
            <AvailabilityBadge status="available" />
          </div>
        </div>

        {/* 店舗基本情報 */}
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 店舗名とカテゴリ */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 leading-tight truncate">
                {formData.name || '（店舗名未入力）'}
              </h3>
            </div>

            {/* 住所 + 地図アイコン（横並び） */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate">{formData.address || '（住所未入力）'}</span>
              {formData.latitude && formData.longitude && (
                <AddressWithMapLink
                  address={formData.address || ''}
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                />
              )}
            </div>

            {/* カテゴリ */}
            <ShopCategoryBadge category={formData.category as any} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

