import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { apiService } from '../../services/api';
import { User as UserIcon, Bookmark } from 'lucide-react';
import { UserPushNotificationSettings } from '../user/UserPushNotificationSettings';
import { FavoriteShopCard } from '../shop/FavoriteShopCard';
import { useFavorites } from '../../hooks/useFavorites';
import { Shop } from '../../types/shop';
import { CreateReservationModal } from '../reservation/CreateReservationModal';
import { Link } from 'react-router-dom';
import { SEO } from '../SEO';

export const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { isFavorite: checkIsFavorite, toggleFavorite, isToggling } = useFavorites(isAuthenticated);
  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [reservationEnabledMap, setReservationEnabledMap] = useState<Record<string, boolean>>({});
  const [reserveShop, setReserveShop] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // userの変更にnameを同期
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  // 位置情報を取得
  useEffect(() => {
    const getUserLocation = (): Promise<{lat: number, lng: number}> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('位置情報がサポートされていません'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (_error) => {
            reject(new Error('位置情報の取得に失敗しました'));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5分
          }
        );
      });
    };

    getUserLocation()
      .then((location) => {
        console.log('位置情報を取得しました:', location);
        setUserLocation(location);
      })
      .catch((error) => {
        console.warn('位置情報の取得に失敗:', error);
        // 位置情報が取得できない場合でも続行
      });
  }, []);

  useEffect(() => {
    // userがnullの場合は何もしない
    if (!user?.id) {
      setFavoriteShops([]);
      setIsLoadingFavorites(false);
      return;
    }
    
    let mounted = true;
    const loadFavorites = async () => {
      try {
        setIsLoadingFavorites(true);
        const res = await apiService.getFavorites();
        const ids = res.favorites || [];
        // それぞれの店舗情報を取得
        const shops = await Promise.all(ids.map(async (id: string) => {
          try {
            const shop = await apiService.getShop(id);
            return shop;
          } catch {
            return null;
          }
        }));
        const validShops = shops.filter((shop): shop is Shop => shop !== null);
        if (mounted) {
          // 位置情報がある場合は距離を計算して店舗情報を更新
          let shopsWithDistance = validShops;
          if (userLocation) {
            try {
              // 位置情報ベースで店舗を検索して距離情報を取得
              const response = await apiService.searchShopsByLocation(
                userLocation.lat,
                userLocation.lng,
                { radius: 50 } // 50km以内の店舗を取得
              );
              
              // 距離情報を含む店舗マップを作成
              const shopsWithDistanceMap = new Map(
                (response.shops || []).map((shop: any) => [shop.id, shop])
              );
              
              // お気に入り店舗に距離情報を追加
              shopsWithDistance = validShops.map(shop => {
                const shopWithDistance = shopsWithDistanceMap.get(shop.id);
                if (shopWithDistance && shopWithDistance.distance !== undefined) {
                  return { ...shop, distance: shopWithDistance.distance };
                }
                return shop;
              });
            } catch (error) {
              console.warn('距離情報の取得に失敗:', error);
              // 距離情報が取得できない場合でも続行
            }
          }
          
          setFavoriteShops(shopsWithDistance);
          
          // 予約機能の有効状態を取得
          const featuresResults = await Promise.all(
            shopsWithDistance.map(async (shop) => {
              try {
                const featuresRes = await apiService.getShopFeatures(shop.id);
                return [shop.id, featuresRes.features?.reservation === true] as const;
              } catch {
                return [shop.id, false] as const;
              }
            })
          );
          
          const featuresMap: Record<string, boolean> = {};
          featuresResults.forEach(([id, enabled]) => {
            featuresMap[id] = enabled;
          });
          setReservationEnabledMap(featuresMap);
        }
      } catch (e) {
        console.warn('Failed to load favorites', e);
      } finally {
        if (mounted) setIsLoadingFavorites(false);
      }
    };
    loadFavorites();
    return () => { mounted = false; };
  }, [user?.id, userLocation]);

  const handleToggleFavorite = async (_e: React.MouseEvent, shopId: string) => {
    try {
      await toggleFavorite(shopId);
      // お気に入り解除された場合はリストから削除
      if (!checkIsFavorite(shopId)) {
        setFavoriteShops((prev) => prev.filter((s) => s.id !== shopId));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // userがnullの場合は何も表示しない（renderの部分で条件分岐）
  if (!user) {
    return null;
  }

  return (
    <>
      <SEO
        title="マイプロフィール"
        description="プロフィール情報の確認・編集"
        canonical="https://furanomi.com/user/profile"
      />
      <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 inline-flex items-center gap-2">
          <UserIcon className="w-5 h-5" /> マイプロフィール
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            メールアドレス
          </label>
          <p className="text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            ニックネーム
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ニックネーム"
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={async () => {
              if (saving) return;
              setSaving(true);
              try {
                await apiService.updateUserProfile({ name: name.trim() });
                toast({ title: '保存しました', description: 'プロフィールを更新しました' });
              } catch (error: any) {
                toast({ title: 'エラー', description: error?.message || '保存に失敗しました', variant: 'destructive' });
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || name.trim().length === 0}
            className="w-full"
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
        </div>
      </div>

      {/* お気に入り一覧 */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-4 sm:mt-6">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold inline-flex items-center gap-2">
            <Bookmark className="w-5 h-5" /> お気に入り店舗
          </h2>
        </div>
        {isLoadingFavorites ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : favoriteShops.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-600 mb-2">お気に入り登録された店舗はまだありません。</p>
            <Link
              to="/user"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-block"
            >
              店舗を探す →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {favoriteShops.map((shop) => (
              <FavoriteShopCard
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
          </div>
        )}
      </div>

      {/* 予約モーダル */}
      {reserveShop && (
        <CreateReservationModal
          isOpen={true}
          onClose={() => setReserveShop(null)}
          shopId={reserveShop.id}
          shopName={reserveShop.name}
        />
      )}

      {/* プッシュ通知設定 */}
      <div className="mt-6">
        <UserPushNotificationSettings />
      </div>
    </div>
    </>
  );
};
