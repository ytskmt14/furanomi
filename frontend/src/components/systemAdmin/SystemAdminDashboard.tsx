import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { apiService } from '../../services/api';

interface DashboardStats {
  totalShops: number;
  totalManagers: number;
  activeShops: number;
  featuresUsage: { feature_name: string; enabled_count: number }[];
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

      {/* 拡張機能の利用状況 */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">拡張機能の利用状況</CardTitle>
        </CardHeader>
        <CardContent>
          {(!stats.featuresUsage || stats.featuresUsage.length === 0) ? (
            <div className="text-center py-8 text-gray-500">利用中の拡張機能はありません</div>
          ) : (
            <div className="space-y-3">
              {stats.featuresUsage.map((f) => (
                <div key={f.feature_name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {f.feature_name === 'reservation' ? '予約機能' : f.feature_name}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800">{f.enabled_count}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
