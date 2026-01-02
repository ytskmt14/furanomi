import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Shop } from '../types/shop';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { apiService } from '../services/api';
import { ShopCard } from './shop/ShopCard';
import { CreateReservationModal } from './reservation/CreateReservationModal';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';

interface MapViewProps {
  shops: Shop[];
  userLocation: { lat: number; lng: number } | null;
  onShopSelect: (shop: Shop) => void;
}

// Google Mapsコンポーネントを遅延ロード
const GoogleMapComponent = lazy(() => import('./GoogleMapComponent'));

export const MapView: React.FC<MapViewProps> = ({ shops, userLocation, onShopSelect }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite: checkIsFavorite, toggleFavorite, isToggling } = useFavorites(isAuthenticated);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const [reserveShop, setReserveShop] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 選択された店舗の予約機能を確認
  useEffect(() => {
    const fetchReservationFeature = async () => {
      if (!selectedShop) {
        setReservationEnabled(false);
        return;
      }

      try {
        const res = await apiService.getShopFeatures(selectedShop.id);
        setReservationEnabled(res.features?.reservation === true);
      } catch {
        setReservationEnabled(false);
      }
    };

    fetchReservationFeature();
  }, [selectedShop]);

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setIsDialogOpen(true);
    onShopSelect(shop);
  };

  const handleToggleFavorite = async (_e: React.MouseEvent, shopId: string) => {
    try {
      await toggleFavorite(shopId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedShop(null);
  };

  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">地図を読み込み中...</p>
          </div>
        </div>
      }>
        <GoogleMapComponent 
          shops={shops} 
          userLocation={userLocation} 
          onShopSelect={handleShopSelect} 
        />
      </Suspense>

      {/* 店舗情報ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:p-6">
          {selectedShop && (
            <div className="p-4 sm:p-0">
              <ShopCard
                shop={selectedShop}
                isAuthenticated={isAuthenticated}
                isFavorite={checkIsFavorite(selectedShop.id)}
                isLoading={isToggling(selectedShop.id)}
                reservationEnabled={reservationEnabled}
                onToggleFavorite={handleToggleFavorite}
                onReservation={(shopId, shopName) => {
                  setReserveShop({ id: shopId, name: shopName });
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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