import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { apiService } from '../../services/api';

interface DashboardStats {
  totalShops: number;
  totalManagers: number;
  activeShops: number;
  recentShops: any[];
}

export const SystemAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await apiService.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('統計情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-600">システム全体の状況を確認できます</p>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-4 px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-600">システム全体の状況を確認できます</p>
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error || 'データの取得に失敗しました'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {/* ページタイトル */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-600">
          システム全体の状況を確認できます
        </p>
      </div>

      {/* 統計カード - モバイルファースト */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🏪</span>
              <div className="text-right">
                <div className="text-lg font-bold">{stats.totalShops}</div>
                <p className="text-xs text-gray-500">総店舗数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">👥</span>
              <div className="text-right">
                <div className="text-lg font-bold">{stats.totalManagers}</div>
                <p className="text-xs text-gray-500">総管理者数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">✅</span>
              <div className="text-right">
                <div className="text-lg font-bold">{stats.activeShops}</div>
                <p className="text-xs text-gray-500">アクティブ店舗</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📊</span>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {stats.totalShops > 0 ? Math.round((stats.activeShops / stats.totalShops) * 100) : 0}%
                </div>
                <p className="text-xs text-gray-500">利用率</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近追加された店舗 */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">最近追加された店舗</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentShops.length > 0 ? (
            <div className="space-y-4">
              {stats.recentShops.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {shop.category === 'restaurant' ? '🍽️' : 
                         shop.category === 'cafe' ? '☕' : '🍺'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{shop.name}</h3>
                      <p className="text-sm text-gray-600">{shop.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      新規登録
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(shop.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              最近追加された店舗はありません
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
