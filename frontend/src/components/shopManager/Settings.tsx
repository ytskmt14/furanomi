import React from 'react';
import { PushNotificationSettings } from './PushNotificationSettings';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      
      <div className="space-y-6">
        <PushNotificationSettings />
      </div>
    </div>
  );
};

