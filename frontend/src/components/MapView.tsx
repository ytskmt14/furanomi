import React, { lazy, Suspense } from 'react';
import { Shop } from '../types/shop';

interface MapViewProps {
  shops: Shop[];
  userLocation: { lat: number; lng: number } | null;
  onShopSelect: (shop: Shop) => void;
}

// Google Mapsコンポーネントを遅延ロード
const GoogleMapComponent = lazy(() => import('./GoogleMapComponent'));

export const MapView: React.FC<MapViewProps> = ({ shops, userLocation, onShopSelect }) => {
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
          onShopSelect={onShopSelect} 
        />
      </Suspense>
    </div>
  );
};