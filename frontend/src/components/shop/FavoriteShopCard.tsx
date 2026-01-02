/**
 * お気に入り店舗用簡易カードコンポーネント
 * 2カラム構成で左に画像、右に情報を表示
 */

import React from 'react';
import { Shop } from '../../types/shop';
import { Card } from '../ui/card';
import { LazyImage } from '../LazyImage';
import { FavoriteButton } from './FavoriteButton';
import { AvailabilityBadge } from './AvailabilityBadge';
import { Clock, CalendarDays } from 'lucide-react';

interface FavoriteShopCardProps {
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
 * お気に入り店舗用簡易カードコンポーネント
 */
export const FavoriteShopCard: React.FC<FavoriteShopCardProps> = ({
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
    <Card className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4">
        {/* 左側: 店舗画像 */}
        <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 overflow-hidden bg-gray-50 rounded-lg">
          <LazyImage
            src={
              shop.image_url ||
              `https://via.placeholder.com/400x300?text=${encodeURIComponent(
                shop.name
              )}`
            }
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 右側: 店舗情報 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 sm:py-1">
          <div className="space-y-1.5 sm:space-y-2">
            {/* 店舗名とお気に入りボタン */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 leading-tight line-clamp-2 flex-1">
                {shop.name}
              </h3>
              {isAuthenticated && (
                <div className="flex-shrink-0">
                  <FavoriteButton
                    isFavorite={isFavorite}
                    isLoading={isLoading}
                    onClick={(e) => onToggleFavorite(e, shop.id)}
                  />
                </div>
              )}
            </div>

            {/* 空き状況バッジと予約ボタン（横並び） */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 空き状況バッジ */}
              <div className="flex items-center flex-shrink-0">
                <AvailabilityBadge status={shop.availability_status} />
              </div>

              {/* 予約ボタン（アイコンのみ） */}
              {isAuthenticated && reservationEnabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isClosed) {
                      onReservation(shop.id, shop.name);
                    }
                  }}
                  disabled={isClosed}
                  className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation ${
                    isClosed
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50 active:bg-blue-100'
                  }`}
                  aria-label={isClosed ? '営業時間外' : '予約する'}
                >
                  {isClosed ? (
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

