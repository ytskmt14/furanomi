import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { apiService } from '../../services/api';
import { Utensils, Coffee, Wine, Store } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  business_hours: any;
  image_url: string;
  availability_status?: string;
  availability_updated_at?: string;
}

export const ShopManagerDashboard: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    const iconProps = { className: 'w-6 h-6 text-blue-600' } as const;
    switch (category) {
      case 'restaurant':
        return <Utensils {...iconProps} />;
      case 'cafe':
        return <Coffee {...iconProps} />;
      case 'izakaya':
        return <Wine {...iconProps} />;
      default:
        return <Store {...iconProps} />;
    }
  };

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const shopData = await apiService.getMyShop();
        setShop(shopData);
      } catch (err) {
        console.error('Failed to fetch shop:', err);
        setError('店舗情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

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
    <div className="space-y-6">
      {/* ページタイトル */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-600">
          店舗の状況を確認し、管理を行います
        </p>
      </div>

      {/* 店舗概要カード */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              {getCategoryIcon(shop.category)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{shop.name}</h2>
              <p className="text-sm text-gray-600">{shop.address}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {availability?.status === 'available' ? '🟢' : 
                 availability?.status === 'busy' ? '🟡' : 
                 availability?.status === 'full' ? '🔴' : '⚫'}
              </div>
              <p className="text-sm text-gray-600 mt-1">現在の状況</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {shop.business_hours?.monday?.open && shop.business_hours?.monday?.close
                  ? `${shop.business_hours.monday.open} - ${shop.business_hours.monday.close}`
                  : '未設定'}
              </div>
              <p className="text-sm text-gray-600 mt-1">営業時間</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {shop.phone || '未設定'}
              </div>
              <p className="text-sm text-gray-600 mt-1">電話番号</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
