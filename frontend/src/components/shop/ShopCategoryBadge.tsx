/**
 * 店舗カテゴリバッジコンポーネント
 * 店舗のカテゴリを表示
 */

import React from 'react';
import { ShopCategory } from '../../types/shop';
import { getCategoryText } from '../../utils/helpers';

interface ShopCategoryBadgeProps {
  /** 店舗カテゴリ */
  category: ShopCategory;
}

/**
 * カテゴリバッジ
 *
 * @example
 * ```tsx
 * <ShopCategoryBadge category="restaurant" />
 * ```
 */
export const ShopCategoryBadge: React.FC<ShopCategoryBadgeProps> = ({ category }) => {
  return (
    <div className="flex items-center">
      <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
        #{getCategoryText(category)}
      </span>
    </div>
  );
};
