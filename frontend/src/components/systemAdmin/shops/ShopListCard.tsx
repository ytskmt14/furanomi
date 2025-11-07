/**
 * 店舗一覧カードコンポーネント
 * 個別の店舗情報をカード形式で表示
 */

import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Shop } from '../../../types/shop';

interface ShopListCardProps {
  /** 店舗情報 */
  shop: Shop;
  /** カテゴリをアイコンに変換 */
  getCategoryIcon: (category: string) => string;
  /** カテゴリをラベルに変換 */
  getCategoryLabel: (category: string) => string;
  /** 店舗の有効機能 */
  enabledFeatures: Record<string, boolean>;
  /** 機能ラベル */
  featureLabels: Record<string, string>;
  /** 編集ボタンクリック時 */
  onEdit: (shop: Shop) => void;
  /** 削除ボタンクリック時 */
  onDelete: (shopId: string) => void;
  /** 機能設定ボタンクリック時 */
  onFeatureSettings: (shopId: string, shopName: string) => void;
}

/**
 * 店舗リストカードコンポーネント
 *
 * @example
 * ```tsx
 * <ShopListCard
 *   shop={shop}
 *   getCategoryIcon={getCategoryIcon}
 *   getCategoryLabel={getCategoryLabel}
 *   enabledFeatures={featuresMap[shop.id]}
 *   featureLabels={FEATURE_LABELS}
 *   onEdit={handleEditShop}
 *   onDelete={handleDeleteShop}
 *   onFeatureSettings={handleFeatureSettings}
 * />
 * ```
 */
export const ShopListCard: React.FC<ShopListCardProps> = ({
  shop,
  getCategoryIcon,
  getCategoryLabel,
  enabledFeatures,
  featureLabels,
  onEdit,
  onDelete,
  onFeatureSettings,
}) => {
  const handleDelete = () => {
    if (confirm(`${shop.name} を削除しますか？`)) {
      onDelete(shop.id);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getCategoryIcon(shop.category)}</span>
              <h3 className="text-sm font-semibold text-gray-900">{shop.name}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getCategoryLabel(shop.category)}</p>
          </div>

          <Badge className={shop.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {shop.is_active ? '公開中' : '非公開'}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {shop.shop_manager && (
            <div>
              <span className="text-gray-500">管理者:</span> {shop.shop_manager.first_name} {shop.shop_manager.last_name}
            </div>
          )}
          {shop.phone && (
            <div>
              <span className="text-gray-500">電話:</span> {shop.phone}
            </div>
          )}
          {Object.keys(enabledFeatures || {}).length > 0 && (
            <div>
              <span className="text-gray-500">機能:</span>{' '}
              <span>
                {Object.entries(enabledFeatures)
                  .filter(([_, enabled]) => enabled)
                  .map(([feature]) => featureLabels[feature] || feature)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(shop)}
            className="flex-1 text-xs"
          >
            編集
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFeatureSettings(shop.id, shop.name)}
            className="flex-1 text-xs"
          >
            ⚙️ 機能
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex-1 text-red-600 hover:text-red-700 text-xs"
          >
            削除
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
