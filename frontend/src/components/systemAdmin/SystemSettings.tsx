import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { apiService } from '../../services/api';

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 設定値の状態
  const [formData, setFormData] = useState({
    search_radius: '1000', // デフォルト1km
    max_shops_display: '50',
    auto_refresh_interval: '30'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsData = await apiService.getSystemSettings();
      setSettings(settingsData);
      
      // 設定値をフォームに設定
      const settingsMap = settingsData.reduce((acc: any, setting: SystemSetting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      
      setFormData(prev => ({
        ...prev,
        ...settingsMap
      }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('設定の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      // 設定を更新
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        description: getSettingDescription(key)
      }));

      await apiService.updateSystemSettings(settingsToUpdate);
      
      setSaveMessage('設定を保存しました');
      await fetchSettings(); // 最新の設定を再取得
      
      // 3秒後にメッセージを消す
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      search_radius: '店舗検索時の検索半径（メートル）',
      max_shops_display: '一覧表示する最大店舗数',
      auto_refresh_interval: '自動更新間隔（秒）'
    };
    return descriptions[key] || '';
  };

  const getSettingLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      search_radius: '検索半径',
      max_shops_display: '最大表示店舗数',
      auto_refresh_interval: '自動更新間隔'
    };
    return labels[key] || key;
  };

  const getSettingUnit = (key: string): string => {
    const units: { [key: string]: string } = {
      search_radius: 'm',
      max_shops_display: '件',
      auto_refresh_interval: '秒'
    };
    return units[key] || '';
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">システム設定</h1>
          <p className="mt-1 text-sm text-gray-600">
            システム全体の設定を管理します
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
      <div>
        <h1 className="text-xl font-bold text-gray-900">システム設定</h1>
        <p className="mt-1 text-sm text-gray-600">
          システム全体の設定を管理します
        </p>
      </div>

      {/* メッセージ表示 */}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-800 text-sm">{saveMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* 設定フォーム - モバイルファーストデザイン */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">基本設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 検索半径 */}
          <div>
            <Label htmlFor="search_radius" className="text-sm font-medium text-gray-700">
              検索半径
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="search_radius"
                type="number"
                value={formData.search_radius}
                onChange={(e) => setFormData({ ...formData, search_radius: e.target.value })}
                className="flex-1"
                min="100"
                max="10000"
                step="100"
              />
              <span className="text-sm text-gray-500">m</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              店舗検索時の検索半径（100-10000m）
            </p>
          </div>

          {/* 最大表示店舗数 */}
          <div>
            <Label htmlFor="max_shops_display" className="text-sm font-medium text-gray-700">
              最大表示店舗数
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="max_shops_display"
                type="number"
                value={formData.max_shops_display}
                onChange={(e) => setFormData({ ...formData, max_shops_display: e.target.value })}
                className="flex-1"
                min="10"
                max="200"
                step="10"
              />
              <span className="text-sm text-gray-500">件</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              一覧表示する最大店舗数（10-200件）
            </p>
          </div>

          {/* 自動更新間隔 */}
          <div>
            <Label htmlFor="auto_refresh_interval" className="text-sm font-medium text-gray-700">
              自動更新間隔
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="auto_refresh_interval"
                type="number"
                value={formData.auto_refresh_interval}
                onChange={(e) => setFormData({ ...formData, auto_refresh_interval: e.target.value })}
                className="flex-1"
                min="10"
                max="300"
                step="10"
              />
              <span className="text-sm text-gray-500">秒</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              空き状況の自動更新間隔（10-300秒）
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 現在の設定一覧 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">現在の設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings
              .filter(setting => ['search_radius', 'max_shops_display', 'auto_refresh_interval'].includes(setting.key))
              .map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    {getSettingLabel(setting.key)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {setting.description}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {setting.value}{getSettingUnit(setting.key)}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(setting.updated_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="flex flex-col space-y-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isSaving ? '保存中...' : '設定を保存'}
        </Button>
      </div>
    </div>
  );
};
