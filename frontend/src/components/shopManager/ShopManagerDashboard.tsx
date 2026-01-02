import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Eye, RefreshCw } from 'lucide-react';
import { ShopPreviewForManager } from './ShopPreviewForManager';
import { ShopFormData } from './hooks/useShopInfo';

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  latitude?: number;
  longitude?: number;
  business_hours: any;
  image_url: string;
  is_active?: boolean;
  availability_status?: string;
  availability_updated_at?: string;
}

export const ShopManagerDashboard: React.FC = () => {
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('closed');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const shopData = await apiService.getMyShop();
        setShop(shopData);
        setSelectedStatus(shopData.availability_status || 'closed');
      } catch (err) {
        console.error('Failed to fetch shop:', err);
        setError('店舗情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  const handleStatusUpdate = async () => {
    if (!shop) return;
    
    setIsUpdating(true);
    
    try {
      await apiService.updateAvailability(shop.id, selectedStatus);
      const updatedShop = await apiService.getMyShop();
      setShop(updatedShop);
      setSelectedStatus(updatedShop.availability_status || 'closed');
      toast({
        title: "更新完了",
        description: "空き状況を更新しました！",
        variant: "success",
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "更新失敗",
        description: "更新に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const availabilityOptions = [
    { value: 'available', label: '空きあり', icon: '🟢', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'busy', label: '混雑', icon: '🟡', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'full', label: '満席', icon: '🔴', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'closed', label: '営業時間外', icon: '⚫', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  ];

  // プレビュー用のフォームデータを作成
  const formDataForPreview: ShopFormData = shop ? {
    name: shop.name,
    description: shop.description || '',
    address: shop.address,
    phone: shop.phone || '',
    email: shop.email || '',
    category: shop.category as any,
    latitude: shop.latitude || 0,
    longitude: shop.longitude || 0,
    postal_code: '',
    formatted_address: '',
    place_id: '',
    business_hours: shop.business_hours || {},
    image_url: shop.image_url || '',
    is_active: shop.is_active || false,
  } : {
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    category: 'izakaya',
    latitude: 0,
    longitude: 0,
    postal_code: '',
    formatted_address: '',
    place_id: '',
    business_hours: {},
    image_url: '',
    is_active: false,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗の状況を確認し、管理を行います
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗の状況を確認し、管理を行います
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || '店舗情報が見つかりません'}</p>
        </div>
      </div>
    );
  }

  const availability = {
    status: shop.availability_status,
    updated_at: shop.availability_updated_at
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* 空き状況更新カード */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">空き状況更新</h2>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* 現在の空き状況表示 */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">現在の空き状況</p>
              <div className="flex items-center gap-3">
                <div className="text-2xl sm:text-3xl">
                  {availability?.status === 'available' ? '🟢' : 
                   availability?.status === 'busy' ? '🟡' : 
                   availability?.status === 'full' ? '🔴' : '⚫'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {availabilityOptions.find(opt => opt.value === availability?.status)?.label || '未設定'}
                  </p>
                  {availability?.updated_at && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      最終更新: {new Date(availability.updated_at).toLocaleString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-3">新しい空き状況を選択してください</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availabilityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedStatus === option.value
                        ? `${option.color} border-current`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6"
            >
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  更新中...
                </div>
              ) : (
                '空き状況を更新'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* プレビューカード */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">プレビュー</h2>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ShopPreviewForManager formData={formDataForPreview} />
        </CardContent>
      </Card>

    </div>
  );
};
