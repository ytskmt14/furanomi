import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';

interface ShopFeatureSettingsModalProps {
  shopId: string;
  shopName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShopFeatureSettingsModal: React.FC<ShopFeatureSettingsModalProps> = ({
  shopId,
  shopName,
  isOpen,
  onClose
}) => {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && shopId) {
      loadFeatures();
    }
  }, [isOpen, shopId]);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const response = await apiService.getShopFeatures(shopId);
      setFeatures(response.features);
    } catch (error: any) {
      console.error('Failed to load features:', error);
      toast({
        title: 'エラー',
        description: '機能設定の読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (featureName: string, enabled: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: enabled
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.updateShopFeaturesBulk(shopId, features);
      toast({
        title: '保存完了',
        description: '機能設定を保存しました',
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to save features:', error);
      toast({
        title: '保存失敗',
        description: error.message || '機能設定の保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Phase2で利用可能な機能一覧
  const availableFeatures = [
    {
      name: 'reservation',
      label: '予約機能',
      description: '利用者が店舗を予約できる機能',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">機能設定: {shopName}</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {availableFeatures.map((feature) => (
                  <div key={feature.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.label}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={features[feature.name] || false}
                          onChange={(e) => handleToggle(feature.name, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {saving ? '保存中...' : '保存'}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


