import React, { useEffect, useRef } from 'react';
import { Shop } from '../types/shop';
import { Card, CardContent } from './ui/card';

interface MapViewProps {
  shops: Shop[];
  onShopSelect: (shop: Shop) => void;
  center?: { lat: number; lng: number };
}

export const MapView: React.FC<MapViewProps> = ({ center }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // 一時的に地図機能を無効化
        console.log('Map initialization disabled for now');
        
        // プレースホルダーとして地図エリアを表示
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              background-color: #f8f9fa;
              border: 2px dashed #dee2e6;
              border-radius: 8px;
              color: #6c757d;
              font-size: 1.2rem;
              text-align: center;
            ">
              <div>
                <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
                <div>地図機能は準備中です</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem;">
                  Google Maps APIキーを設定してください
                </div>
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [center]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">地図で確認</h2>
      <Card>
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden" />
        </CardContent>
      </Card>
      <div className="flex justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>空きあり</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span>混雑</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>満席</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-gray-500"></span>
          <span>営業時間外</span>
        </div>
      </div>
    </div>
  );
};