import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Shop } from '../types/shop';
import { getAvailabilityColorValue } from '../utils/helpers';

interface MapViewProps {
  shops: Shop[];
  userLocation: { lat: number; lng: number } | null;
  onShopSelect: (shop: Shop) => void;
}

// グローバル変数で初期化状態を管理
let isGoogleMapsInitialized = false;

export const MapView: React.FC<MapViewProps> = ({ shops, userLocation, onShopSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        console.log('Google Maps API Key:', apiKey ? '設定済み' : '未設定');
        
        if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
          setError('Google Maps API キーが設定されていません');
          return;
        }

        // 一度だけ初期化
        if (!isGoogleMapsInitialized) {
          setOptions({
            apiKey,
            version: 'weekly',
          });
          isGoogleMapsInitialized = true;
        }

        const { Map } = await importLibrary('maps');
        const { Marker } = await importLibrary('marker');

        if (mapRef.current) {
          // 位置情報の検証
          const defaultCenter = userLocation && 
            typeof userLocation.lat === 'number' && 
            typeof userLocation.lng === 'number' && 
            !isNaN(userLocation.lat) && 
            !isNaN(userLocation.lng)
            ? userLocation 
            : { lat: 33.6667, lng: 130.4167 }; // 福岡県福岡市東区香椎をデフォルト

          mapInstanceRef.current = new Map(mapRef.current, {
            center: defaultCenter,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });

          // 現在地マーカーを追加
          if (userLocation && 
              typeof userLocation.lat === 'number' && 
              typeof userLocation.lng === 'number' && 
              !isNaN(userLocation.lat) && 
              !isNaN(userLocation.lng)) {
            new Marker({
              position: userLocation,
              map: mapInstanceRef.current,
              title: '現在地',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
              },
            });
          }

          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Google Maps の初期化に失敗しました:', err);
        setError('地図の読み込みに失敗しました');
      }
    };

    initMap();
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // 既存のマーカーをクリア
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 新しいマーカーを追加
    shops.forEach(shop => {
      // 店舗の位置情報を検証
      if (typeof shop.latitude === 'number' && 
          typeof shop.longitude === 'number' && 
          !isNaN(shop.latitude) && 
          !isNaN(shop.longitude)) {
        const marker = new google.maps.Marker({
          position: { lat: shop.latitude, lng: shop.longitude },
          map: mapInstanceRef.current,
          title: shop.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${getAvailabilityColorValue(shop.availability_status)}" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${shop.name.charAt(0)}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
          },
        });

        marker.addListener('click', () => {
          onShopSelect(shop);
        });

        markersRef.current.push(marker);
      }
    });
  }, [shops, isLoaded, onShopSelect]);

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">地図で確認</h2>
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-2">{error}</p>
            <p className="text-sm text-gray-500">
              Google Maps API キーを設定してください
            </p>
          </div>
        </div>
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
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">地図で確認</h2>
      <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
        <div ref={mapRef} className="w-full h-full" />
      </div>
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