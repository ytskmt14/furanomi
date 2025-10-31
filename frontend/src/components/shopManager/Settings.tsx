import React, { useState, useEffect } from 'react';
import { PushNotificationSettings } from './PushNotificationSettings';
import { FeatureStatus } from './FeatureStatus';
import { apiService } from '../../services/api';

export const Settings: React.FC = () => {
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopId = async () => {
      try {
        const shopData = await apiService.getMyShop();
        setShopId(shopData.id);
      } catch (error) {
        console.error('Failed to fetch shop:', error);
      }
    };
    fetchShopId();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      
      <div className="space-y-6">
        {shopId && <FeatureStatus shopId={shopId} />}
        <PushNotificationSettings />
      </div>
    </div>
  );
};

