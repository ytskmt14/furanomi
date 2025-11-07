/**
 * 店舗カードコンポーネント
 * 個別の店舗情報をカード形式で表示
 */

import React from 'react';
import { Shop } from '../../types/shop';
import { Card, CardContent } from '../ui/card';
import { LazyImage } from '../LazyImage';
import { Clock } from 'lucide-react';
import { AvailabilityBadge } from './AvailabilityBadge';
import { DistanceDisplay } from './DistanceDisplay';
import { AddressWithMapLink } from './AddressWithMapLink';
import { ShopCategoryBadge } from './ShopCategoryBadge';
import { FavoriteButton } from './FavoriteButton';
import { ReservationButton } from './ReservationButton';

interface ShopCardProps {
  /** 店舗情報 */
  shop: Shop;
  /** 認証済みか */
  isAuthenticated: boolean;
  /** お気に入り状態 */
  isFavorite: boolean;
  /** 処理中か */
  isLoading: boolean;
  /** 予約機能が有効か */
  reservationEnabled: boolean;
  /** お気に入りボタンクリック時 */
  onToggleFavorite: (e: React.MouseEvent, shopId: string) => Promise<void>;
  /** 予約ボタンクリック時 */
  onReservation: (shopId: string, shopName: string) => void;
}

/**
 * 店舗カードコンポーネント
 *
 * @example
 * ```tsx
 * <ShopCard
 *   shop={shop}
 *   isAuthenticated={true}
 *   isFavorite={false}
 *   isLoading={false}
 *   reservationEnabled={true}
 *   onToggleFavorite={(e, id) => toggleFavorite(e, id)}
 *   onReservation={(id, name) => openModal(id, name)}
 * />
 * ```
 */
export const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  isAuthenticated,
  isFavorite,
  isLoading,
  reservationEnabled,
  onToggleFavorite,
  onReservation,
}) => {
  const isClosed = shop.availability_status === 'closed';

  return (
    <Card
      className={`relative group mx-1 my-2 overflow-hidden bg-white border-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        isClosed
          ? 'cursor-not-allowed'
          : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1'
      }`}
    >
      {/* 営業時間外オーバーレイ */}
      {isClosed && (
        <div className="absolute inset-0 bg-gray-500/80 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="text-center text-white">
            <Clock className="w-10 h-10 mb-2 mx-auto" />
            <div className="text-lg font-semibold">営業時間外</div>
          </div>
        </div>
      )}

      {/* 店舗画像 */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-50">
        <LazyImage
          src={
            shop.image_url ||
            `https://via.placeholder.com/400x300?text=${encodeURIComponent(
              shop.name
            )}`
          }
          alt={shop.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />

        {/* 空き状況バッジ（左上） */}
        <div className="absolute top-4 left-4 z-10">
          <AvailabilityBadge status={shop.availability_status} />
        </div>

        {/* 右上: 距離 */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <DistanceDisplay distance={(shop as any).distance} />
        </div>
      </div>

      {/* 店舗基本情報 */}
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 店舗名行（右側にお気に入りトグル）とカテゴリ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-gray-900 leading-tight truncate">
                {shop.name}
              </h3>
              {isAuthenticated && (
                <FavoriteButton
                  isFavorite={isFavorite}
                  isLoading={isLoading}
                  onClick={(e) => onToggleFavorite(e, shop.id)}
                />
              )}
            </div>
          </div>

          {/* 住所 + 地図アイコン（横並び） */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="truncate">{shop.address}</span>
            <AddressWithMapLink
              address={shop.address}
              latitude={shop.latitude}
              longitude={shop.longitude}
            />
          </div>

          {/* カテゴリ */}
          <ShopCategoryBadge category={shop.category} />

          {/* CTA: 予約する */}
          {isAuthenticated && reservationEnabled && (
            <ReservationButton
              enabled={true}
              availabilityStatus={shop.availability_status}
              onClick={(e) => {
                e.stopPropagation();
                if (!isClosed) {
                  onReservation(shop.id, shop.name);
                }
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
