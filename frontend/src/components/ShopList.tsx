import React from 'react';
import { Shop } from '../types/shop';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { LazyImage } from './LazyImage';
import { getAvailabilityText, getCategoryText } from '../utils/helpers';

interface ShopListProps {
  shops: Shop[];
  onShopSelect: (shop: Shop) => void;
}

export const ShopList: React.FC<ShopListProps> = ({ shops, onShopSelect }) => {

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return '🟢';
      case 'busy':
        return '🟡';
      case 'full':
        return '🔴';
      case 'closed':
        return '⚫';
      default:
        return '⚪';
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${distance}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
        {shops.map((shop) => {
          return (
          <Card
            key={shop.id}
            className={`relative group mx-1 my-2 overflow-hidden bg-white border-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ${
              shop.availability_status === 'closed' 
                ? 'cursor-not-allowed' 
                : 'cursor-pointer active:scale-[0.98] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1'
            }`}
            onClick={() => {
              if (shop.availability_status !== 'closed') {
                onShopSelect(shop);
              }
            }}
          >
            {/* 営業時間外オーバーレイ */}
            {shop.availability_status === 'closed' && (
              <div className="absolute inset-0 bg-gray-500/80 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🕒</div>
                  <div className="text-lg font-semibold">営業時間外</div>
                </div>
              </div>
            )}
            {/* 店舗画像 */}
            <div className="relative h-64 w-full overflow-hidden bg-gray-50">
              <LazyImage
                src={shop.image_url || `https://via.placeholder.com/400x300?text=${encodeURIComponent(shop.name)}`}
                alt={shop.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                placeholder={`https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=${encodeURIComponent(shop.name)}`}
              />
              {/* 空き状況バッジ（左上） */}
              <div className="absolute top-4 left-4 z-10">
                <Badge
                  className={`text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg border-0 ${
                    shop.availability_status === 'available' ? 'bg-green-500' :
                    shop.availability_status === 'busy' ? 'bg-orange-500' :
                    shop.availability_status === 'full' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}
                >
                  {getAvailabilityIcon(shop.availability_status)} {getAvailabilityText(shop.availability_status)}
                </Badge>
              </div>
              {/* 距離情報（右上） */}
              {(shop as any).distance && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-white/30">
                    <span className="text-sm font-medium text-gray-700">
                      📍 {formatDistance((shop as any).distance)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 店舗基本情報 */}
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* 店舗名とカテゴリ */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                    {shop.name}
                  </h3>
                  <div className="flex items-center">
                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                      #{getCategoryText(shop.category)}
                    </span>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
          );
        })}
    </div>
  );
};