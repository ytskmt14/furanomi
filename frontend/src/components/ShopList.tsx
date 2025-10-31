import React, { useEffect, useMemo, useState } from 'react';
import { Shop } from '../types/shop';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { LazyImage } from './LazyImage';
import { getAvailabilityText, getCategoryText } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { Star, Navigation, Clock, CheckCircle, AlertTriangle, XCircle, CalendarDays } from 'lucide-react';
import { CreateReservationModal } from './reservation/CreateReservationModal';

interface ShopListProps {
  shops: Shop[];
}

export const ShopList: React.FC<ShopListProps> = ({ shops }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [reserveShop, setReserveShop] = useState<{ id: string; name: string } | null>(null);
  // TTL付きメモリキャッシュ（5分）
  const FEATURE_TTL_MS = 5 * 60 * 1000;
  const [reservationEnabledMap, setReservationEnabledMap] = useState<Record<string, { enabled: boolean; ts: number }>>({});

  // 予約機能ON/OFFを一度だけ取得してキャッシュ
  useEffect(() => {
    const fetchFeatures = async () => {
      const now = Date.now();
      const idsToFetch = shops
        .map((s) => s.id)
        .filter((id) => !reservationEnabledMap[id] || now - reservationEnabledMap[id].ts > FEATURE_TTL_MS);
      if (idsToFetch.length === 0) return;
      try {
        const results = await Promise.all(idsToFetch.map(async (id) => {
          try {
            const res = await apiService.getShopFeatures(id);
            return [id, res.features?.reservation === true] as const;
          } catch {
            return [id, false] as const;
          }
        }));
        setReservationEnabledMap((prev) => {
          const next = { ...prev } as Record<string, { enabled: boolean; ts: number }>;
          const ts = Date.now();
          results.forEach(([id, enabled]) => { next[id] = { enabled, ts }; });
          return next;
        });
      } catch (e) {
        console.warn('Failed to fetch reservation features for shops', e);
      }
    };
    fetchFeatures();
  }, [shops]);

  // 初回にお気に入り一覧を取得（ログイン時のみ）
  useEffect(() => {
    let mounted = true;
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const res = await apiService.getFavorites();
        if (mounted) setFavoriteIds(new Set(res.favorites || []));
      } catch (e) {
        // 失敗しても致命的ではないため通知のみ
        console.warn('Failed to load favorites', e);
      }
    };
    loadFavorites();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const isFavorite = useMemo(() => (shopId: string) => favoriteIds.has(shopId), [favoriteIds]);

  const toggleFavorite = async (e: React.MouseEvent, shopId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({ title: 'ログインが必要です', description: 'お気に入りはログイン後にご利用いただけます', variant: 'destructive' });
      return;
    }
    if (loadingIds.has(shopId)) return;
    const nextLoading = new Set(loadingIds); nextLoading.add(shopId); setLoadingIds(nextLoading);
    try {
      if (favoriteIds.has(shopId)) {
        await apiService.removeFavorite(shopId);
        const next = new Set(favoriteIds); next.delete(shopId); setFavoriteIds(next);
      } else {
        await apiService.addFavorite(shopId);
        const next = new Set(favoriteIds); next.add(shopId); setFavoriteIds(next);
      }
    } catch (error: any) {
      toast({ title: 'エラー', description: error?.message || 'お気に入り更新に失敗しました', variant: 'destructive' });
    } finally {
      const n = new Set(loadingIds); n.delete(shopId); setLoadingIds(n);
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    const common = 'w-4 h-4 mr-1 inline-block';
    switch (availability) {
      case 'available':
        return <CheckCircle className={`${common} text-white`} />;
      case 'busy':
        return <AlertTriangle className={`${common} text-white`} />;
      case 'full':
        return <XCircle className={`${common} text-white`} />;
      case 'closed':
        return <Clock className={`${common} text-white`} />;
      default:
        return null;
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
                : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1'
            }`}
          >
            {/* 営業時間外オーバーレイ */}
            {shop.availability_status === 'closed' && (
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
                src={shop.image_url || `https://via.placeholder.com/400x300?text=${encodeURIComponent(shop.name)}`}
                alt={shop.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
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
                  <span className="inline-flex items-center">
                    {getAvailabilityIcon(shop.availability_status)} {getAvailabilityText(shop.availability_status)}
                  </span>
                </Badge>
              </div>
              {/* 右上: 距離 */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {(shop as any).distance && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-white/30">
                    <span className="text-sm font-medium text-gray-700 inline-flex items-center gap-1">
                      <Navigation className="w-4 h-4" /> {formatDistance((shop as any).distance)}
                    </span>
                  </div>
                )}
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
                      <button
                        aria-label="お気に入り"
                        onClick={(e) => toggleFavorite(e, shop.id)}
                        className={`rounded-full p-1.5 text-sm transition-colors flex items-center justify-center ${
                          isFavorite(shop.id)
                            ? 'text-yellow-600'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        disabled={loadingIds.has(shop.id)}
                      >
                        <Star
                          size={20}
                          strokeWidth={2}
                          className="inline-block"
                          {...(isFavorite(shop.id)
                            ? { fill: 'currentColor' }
                            : { fill: 'none' })}
                        />
                      </button>
                    )}
                  </div>
                </div>
                {/* 住所 + 地図アイコン（横並び） */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="truncate">{shop.address}</span>
                  {(() => {
                    // latitudeとlongitudeを数値に変換してチェック
                    const lat = typeof shop.latitude === 'string' ? parseFloat(shop.latitude) : Number(shop.latitude);
                    const lng = typeof shop.longitude === 'string' ? parseFloat(shop.longitude) : Number(shop.longitude);
                    const hasValidCoords = lat != null && lng != null && !isNaN(lat) && !isNaN(lng) && 
                                           typeof lat === 'number' && typeof lng === 'number' &&
                                           Math.abs(lat) > 0.0001 && Math.abs(lng) > 0.0001;
                    
                    // デバッグログ（常に表示して問題を特定）
                    if (shop.latitude != null || shop.longitude != null) {
                      console.log(`[ShopList] ${shop.name}:`, {
                        shopId: shop.id,
                        originalLat: shop.latitude,
                        originalLng: shop.longitude,
                        originalLatType: typeof shop.latitude,
                        originalLngType: typeof shop.longitude,
                        parsedLat: lat,
                        parsedLng: lng,
                        parsedLatType: typeof lat,
                        parsedLngType: typeof lng,
                        hasValidCoords,
                        willUseAddress: !hasValidCoords
                      });
                    }
                    
                    return (hasValidCoords || shop.address) ? (
                      <a
                        href={
                          hasValidCoords
                            ? `https://www.google.com/maps?q=${lat},${lng}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold tracking-wide text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100"
                        aria-label="地図で開く"
                        onClick={(e) => e.stopPropagation()}
                      >
                        MAP
                      </a>
                    ) : null;
                  })()}
                </div>
                {/* カテゴリ */}
                <div className="flex items-center">
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                    #{getCategoryText(shop.category)}
                  </span>
                </div>

                {/* CTA: 予約する */}
                {isAuthenticated && reservationEnabledMap[shop.id]?.enabled === true && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (shop.availability_status === 'closed') return;
                      setReserveShop({ id: shop.id, name: shop.name });
                    }}
                    disabled={shop.availability_status === 'closed'}
                    className={`w-full mt-3 py-2.5 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                      shop.availability_status === 'closed'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {shop.availability_status === 'closed' ? (
                      <>
                        <Clock className="w-4 h-4" /> 営業時間外
                      </>
                    ) : (
                      <>
                        <CalendarDays className="w-4 h-4" /> 予約する
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })}
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
