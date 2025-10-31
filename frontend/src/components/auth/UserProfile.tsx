import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { apiService } from '../../services/api';
import { User as UserIcon, Bookmark } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteShops, setFavoriteShops] = useState<Array<{ id: string; name: string }>>([]);
  const [favLoadingId, setFavLoadingId] = useState<string | null>(null);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  if (!user) {
    return null;
  }

  useEffect(() => {
    let mounted = true;
    const loadFavorites = async () => {
      try {
        const res = await apiService.getFavorites();
        const ids = res.favorites || [];
        // それぞれの店舗名を取得
        const details = await Promise.all(ids.map(async (id: string) => {
          try {
            const shop = await apiService.getShop(id);
            return { id, name: shop?.name || '店舗' };
          } catch {
            return { id, name: '店舗' };
          }
        }));
        if (mounted) setFavoriteShops(details);
      } catch (e) {
        console.warn('Failed to load favorites', e);
      }
    };
    loadFavorites();
    return () => { mounted = false; };
  }, [user?.id]);

  const handleUnfavorite = async (shopId: string) => {
    if (favLoadingId) return;
    setFavLoadingId(shopId);
    try {
      await apiService.removeFavorite(shopId);
      setFavoriteShops((prev) => prev.filter((s) => s.id !== shopId));
      toast({ title: 'お気に入り解除', description: '店舗をお気に入りから外しました' });
    } catch (error: any) {
      toast({ title: 'エラー', description: error?.message || '解除に失敗しました', variant: 'destructive' });
    } finally {
      setFavLoadingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4 inline-flex items-center gap-2">
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
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 inline-flex items-center gap-2">
          <Bookmark className="w-5 h-5" /> お気に入り店舗
        </h2>
        {favoriteShops.length === 0 ? (
          <p className="text-gray-600">お気に入り登録された店舗はまだありません。</p>
        ) : (
          <ul className="divide-y">
            {favoriteShops.map((shop) => (
              <li key={shop.id} className="py-3 flex items-center justify-between">
                <span className="text-gray-900">{shop.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnfavorite(shop.id)}
                  disabled={favLoadingId === shop.id}
                >
                  {favLoadingId === shop.id ? '処理中...' : '解除'}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
