import React, { useState, useEffect } from 'react';
import { Shop } from '../types/shop';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { apiService } from '../services/api';
import { ShopCard } from './shop/ShopCard';
import { CreateReservationModal } from './reservation/CreateReservationModal';

interface ShopListProps {
  shops: Shop[];
}

export const ShopList: React.FC<ShopListProps> = ({ shops }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite: checkIsFavorite, toggleFavorite, isToggling } = useFavorites(isAuthenticated);
  const [reserveShop, setReserveShop] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 店舗ごとの予約機能有効状態を管理
  const [reservationEnabledMap, setReservationEnabledMap] = useState<
    Record<string, boolean>
  >({});

  // 各店舗の予約機能を並列取得
  useEffect(() => {
    const fetchAllFeatures = async () => {
      const results = await Promise.all(
        shops.map(async (shop) => {
          try {
            const res = await apiService.getShopFeatures(shop.id);
            return [shop.id, res.features?.reservation === true] as const;
          } catch {
            return [shop.id, false] as const;
          }
        })
      );

      const map: Record<string, boolean> = {};
      results.forEach(([id, enabled]) => {
        map[id] = enabled;
      });
      setReservationEnabledMap(map);
    };

    if (shops.length > 0) {
      fetchAllFeatures();
    }
  }, [shops]);

  const handleToggleFavorite = async (_e: React.MouseEvent, shopId: string) => {
    try {
      await toggleFavorite(shopId);
    } catch (error) {
      // Error is already handled by the hook
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
      {shops.map((shop) => (
        <ShopCard
          key={shop.id}
          shop={shop}
          isAuthenticated={isAuthenticated}
          isFavorite={checkIsFavorite(shop.id)}
          isLoading={isToggling(shop.id)}
          reservationEnabled={reservationEnabledMap[shop.id] || false}
          onToggleFavorite={handleToggleFavorite}
          onReservation={(shopId, shopName) => {
            setReserveShop({ id: shopId, name: shopName });
          }}
        />
      ))}

      {/* 予約モーダル */}
      {reserveShop && (
        <CreateReservationModal
          isOpen={true}
          onClose={() => setReserveShop(null)}
          shopId={reserveShop.id}
          shopName={reserveShop.name}
        />
      )}
    </div>
  );
};
