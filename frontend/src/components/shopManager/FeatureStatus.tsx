import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Card } from '../ui/card';

interface FeatureStatusProps {
  shopId: string;
}

interface FeatureInfo {
  name: string;
  label: string;
  description: string;
}

const AVAILABLE_FEATURES: FeatureInfo[] = [
  {
    name: 'reservation',
    label: '予約機能',
    description: '利用者が店舗を予約できる機能',
  },
];

export const FeatureStatus: React.FC<FeatureStatusProps> = ({ shopId }) => {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFeatures();
  }, [shopId]);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const response = await apiService.getShopFeatures(shopId);
      setFeatures(response.features);
    } catch (error: any) {
      console.error('Failed to load features:', error);
      toast({
        title: 'エラー',
        description: '機能情報の読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">利用可能な機能</h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">読み込み中...</p>
        </div>
      </Card>
    );
  }

  const enabledFeatures = AVAILABLE_FEATURES.filter(
    feature => features[feature.name] === true
  );

  if (enabledFeatures.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">利用可能な機能</h2>
        <p className="text-gray-600">現在、追加機能は有効になっていません。</p>
        <p className="text-sm text-gray-500 mt-2">
          機能を有効にするには、システム管理者にお問い合わせください。
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">利用可能な機能</h2>
      <div className="space-y-3">
        {enabledFeatures.map((feature) => (
          <div key={feature.name} className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">{feature.label}</h3>
                <p className="text-sm text-green-700">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

