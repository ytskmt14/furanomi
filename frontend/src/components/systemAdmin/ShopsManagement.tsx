import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { apiService } from '../../services/api';
import { PostalCodeInput } from './PostalCodeInput';

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  category: 'restaurant' | 'cafe' | 'izakaya';
  latitude: number;
  longitude: number;
  business_hours?: {
    monday?: { open: string; close: string; close_next_day?: boolean };
    tuesday?: { open: string; close: string; close_next_day?: boolean };
    wednesday?: { open: string; close: string; close_next_day?: boolean };
    thursday?: { open: string; close: string; close_next_day?: boolean };
    friday?: { open: string; close: string; close_next_day?: boolean };
    saturday?: { open: string; close: string; close_next_day?: boolean };
    sunday?: { open: string; close: string; close_next_day?: boolean };
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shop_manager?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

interface ShopManager {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  shop_name?: string;
}

export const ShopsManagement: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopManagers, setShopManagers] = useState<ShopManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    postalCode: '',              // 追加
    formattedAddress: '',         // 追加
    placeId: '',                  // 追加
    phone: '',
    email: '',
    category: 'restaurant' as 'restaurant' | 'cafe' | 'izakaya',
    latitude: 0,
    longitude: 0,
    shop_manager_id: '',
    business_hours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '21:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '09:00', close: '21:00' }
    }
  });

  // 新規管理者作成フォーム状態
  const [newManagerData, setNewManagerData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [managerMode, setManagerMode] = useState<'existing' | 'new'>('existing');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shopsData, managersData] = await Promise.all([
        apiService.getShops(),
        apiService.getShopManagers()
      ]);
      setShops(shopsData.shops);
      setShopManagers(managersData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = () => {
    setEditingShop(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      postalCode: '',
      formattedAddress: '',
      placeId: '',
      phone: '',
      email: '',
      category: 'restaurant',
      latitude: 0,
      longitude: 0,
      shop_manager_id: '',
      business_hours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '09:00', close: '21:00' }
      }
    });
    setError(null);
    setSuccess(null);
    setNewManagerData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setManagerMode('existing');
    setIsModalOpen(true);
  };

  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      description: shop.description,
      address: shop.address,
      postalCode: shop.postal_code || '',
      formattedAddress: shop.formatted_address || '',
      placeId: shop.place_id || '',
      phone: shop.phone || '',
      email: shop.email || '',
      category: shop.category,
      latitude: shop.latitude,
      longitude: shop.longitude,
      shop_manager_id: shop.shop_manager?.id || '',
      business_hours: shop.business_hours || {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '09:00', close: '21:00' }
      }
    });
    setError(null);
    setSuccess(null);
    setManagerMode('existing');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (managerMode === 'new') {
        // 新規管理者を作成してから店舗を作成
        const newManager = await apiService.createShopManager(newManagerData);
        formData.shop_manager_id = newManager.id;
      }

      if (editingShop) {
        await apiService.updateShopBySystemAdmin(editingShop.id, formData);
      } else {
        await apiService.createShop(formData);
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to save shop:', err);
      setError('保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('この店舗を削除しますか？')) return;

    try {
      await apiService.deleteShop(shopId);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete shop:', err);
      setError('削除に失敗しました');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant': return '🍽️';
      case 'cafe': return '☕';
      case 'izakaya': return '🍺';
      default: return '🏪';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'restaurant': return 'レストラン';
      case 'cafe': return 'カフェ';
      case 'izakaya': return '居酒屋';
      default: return category;
    }
  };

  // 郵便番号から住所を補完
  const handleAddressSelect = (addressData: {
    prefecture: string;
    city: string;
    town: string;
    fullAddress: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.fullAddress
    }));
    
    // 住所が補完されたら自動的にGeocoding実行
    handleGeocodeAddress(addressData.fullAddress);
  };

  // 住所から位置情報を取得（フロントエンドで直接実行 - 開発環境用）
  const handleGeocodeAddress = async (addressOverride?: string) => {
    const targetAddress = addressOverride || formData.address;
    
    if (!targetAddress) return;
    
    setIsGeocoding(true);
    setError(null);
    setSuccess(null);
    
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        throw new Error('Google Maps API キーが設定されていません');
      }
      
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(targetAddress)}&key=${apiKey}&language=ja`;
      
      const response = await fetch(url);
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        setFormData(prev => ({
          ...prev,
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id
        }));
        
        setSuccess(`正規化された住所: ${result.formatted_address}`);
      } else {
        console.error('Geocoding failed:', data.status, data.error_message);
        throw new Error(data.status === 'ZERO_RESULTS' ? '該当する住所が見つかりません' : data.error_message || '位置情報の取得に失敗しました');
      }
    } catch (err: any) {
      console.error('Geocoding failed:', err);
      setError(err.message || '位置情報の取得に失敗しました');
    } finally {
      setIsGeocoding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">店舗管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗の登録・編集・削除を行います
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {/* ページタイトル */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">店舗管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗の登録・編集・削除を行います
          </p>
        </div>
        <Button onClick={handleCreateShop} className="bg-red-600 hover:bg-red-700 text-sm px-3 py-2">
          新規登録
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* 店舗一覧 - モバイルファーストデザイン */}
      <div className="space-y-3">
        {shops.map((shop) => (
          <Card key={shop.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(shop.category)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{shop.name}</h3>
                    <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">
                      {getCategoryLabel(shop.category)}
                    </Badge>
                  </div>
                </div>
                <Badge className={shop.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {shop.is_active ? 'アクティブ' : '非アクティブ'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="w-12 text-gray-500">住所:</span>
                  <span className="flex-1">{shop.address}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 text-gray-500">管理者:</span>
                  <span className="flex-1">
                    {shop.shop_manager ? (
                      `${shop.shop_manager.first_name} ${shop.shop_manager.last_name}`
                    ) : (
                      <span className="text-gray-400">未設定</span>
                    )}
                  </span>
                </div>
                {shop.phone && (
                  <div className="flex items-start">
                    <span className="w-12 text-gray-500">電話:</span>
                    <span className="flex-1">{shop.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditShop(shop)}
                  className="flex-1 text-xs"
                >
                  編集
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteShop(shop.id)}
                  className="flex-1 text-red-600 hover:text-red-700 text-xs"
                >
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white rounded-t-lg md:rounded-lg w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingShop ? '店舗編集' : '新規店舗登録'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 店舗基本情報 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">店舗名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">カテゴリ *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mt-1"
                      required
                    >
                      <option value="restaurant">レストラン</option>
                      <option value="cafe">カフェ</option>
                      <option value="izakaya">居酒屋</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">説明</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mt-1"
                    rows={3}
                  />
                </div>

                {/* 郵便番号入力 */}
                <PostalCodeInput
                  value={formData.postalCode}
                  onChange={(value) => setFormData({ ...formData, postalCode: value })}
                  onAddressSelect={handleAddressSelect}
                />
                
                {/* 住所入力（自動補完または手入力） */}
                <div>
                  <Label htmlFor="address">住所 *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="郵便番号から自動補完、または直接入力"
                    required
                    className="mt-1"
                  />
                </div>
                
                {/* 番地・建物名入力 */}
                <div>
                  <Label htmlFor="address_detail">番地・建物名</Label>
                  <Input
                    id="address_detail"
                    placeholder="1-2-3 〇〇ビル4F"
                    onBlur={(e) => {
                      if (e.target.value) {
                        const fullAddress = `${formData.address}${e.target.value}`;
                        setFormData({ ...formData, address: fullAddress });
                        handleGeocodeAddress(fullAddress);
                      }
                    }}
                    className="mt-1"
                  />
                </div>
                
                {/* 正規化された住所の表示 */}
                {formData.formattedAddress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm font-medium text-blue-900">正規化された住所:</p>
                    <p className="text-sm text-blue-700">{formData.formattedAddress}</p>
                  </div>
                )}
                
                {/* 緯度経度の表示 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>緯度</Label>
                    <Input value={formData.latitude || ''} readOnly className="bg-gray-50 mt-1" />
                  </div>
                  <div>
                    <Label>経度</Label>
                    <Input value={formData.longitude || ''} readOnly className="bg-gray-50 mt-1" />
                  </div>
                </div>
                
                {formData.latitude && formData.longitude && (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">位置情報取得済み</span>
                  </div>
                )}
                
                {/* 手動位置取得ボタン */}
                <div>
                  <Button
                    type="button"
                    onClick={() => handleGeocodeAddress()}
                    disabled={!formData.address || isGeocoding}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGeocoding ? '取得中...' : '位置情報を再取得'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">電話番号</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* 管理者選択 */}
                <div>
                  <Label>店舗管理者</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="existing"
                          checked={managerMode === 'existing'}
                          onChange={(e) => setManagerMode(e.target.value as any)}
                          className="mr-2"
                        />
                        <span className="text-sm">既存の管理者を選択</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="new"
                          checked={managerMode === 'new'}
                          onChange={(e) => setManagerMode(e.target.value as any)}
                          className="mr-2"
                        />
                        <span className="text-sm">新規管理者を作成</span>
                      </label>
                    </div>

                    {managerMode === 'existing' ? (
                      <select
                        value={formData.shop_manager_id}
                        onChange={(e) => setFormData({ ...formData, shop_manager_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">管理者を選択してください</option>
                        {shopManagers
                          .filter(manager => !manager.shop_name || (editingShop && manager.id === editingShop.shop_manager?.id)) // 未紐付または現在の管理者
                          .map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {manager.first_name} {manager.last_name} ({manager.username})
                              {manager.shop_name && editingShop && manager.id === editingShop.shop_manager?.id ? ' (現在)' : ''}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="manager_username">ユーザー名 *</Label>
                            <Input
                              id="manager_username"
                              value={newManagerData.username}
                              onChange={(e) => setNewManagerData({ ...newManagerData, username: e.target.value })}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="manager_email">メールアドレス *</Label>
                            <Input
                              id="manager_email"
                              type="email"
                              value={newManagerData.email}
                              onChange={(e) => setNewManagerData({ ...newManagerData, email: e.target.value })}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="manager_password">パスワード *</Label>
                            <Input
                              id="manager_password"
                              type="password"
                              value={newManagerData.password}
                              onChange={(e) => setNewManagerData({ ...newManagerData, password: e.target.value })}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="manager_phone">電話番号</Label>
                            <Input
                              id="manager_phone"
                              value={newManagerData.phone}
                              onChange={(e) => setNewManagerData({ ...newManagerData, phone: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="manager_firstName">名前 *</Label>
                            <Input
                              id="manager_firstName"
                              value={newManagerData.firstName}
                              onChange={(e) => setNewManagerData({ ...newManagerData, firstName: e.target.value })}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="manager_lastName">姓 *</Label>
                            <Input
                              id="manager_lastName"
                              value={newManagerData.lastName}
                              onChange={(e) => setNewManagerData({ ...newManagerData, lastName: e.target.value })}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ボタン */}
                <div className="flex flex-col space-y-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting ? '保存中...' : '保存'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full"
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
