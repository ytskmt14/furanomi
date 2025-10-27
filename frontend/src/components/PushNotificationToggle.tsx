import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { subscribeToPushNotifications, getCurrentSubscription } from '../services/pushNotifications';

export const PushNotificationToggle: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const subscription = await getCurrentSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      if (isSubscribed) {
        // 購読解除
        const subscription = await getCurrentSubscription();
        if (subscription) {
          const registration = await navigator.serviceWorker.ready;
          const currentSubscription = await registration.pushManager.getSubscription();
          if (currentSubscription) {
            await currentSubscription.unsubscribe();
            setIsSubscribed(false);
          }
        }
      } else {
        // 購読
        const result = await subscribeToPushNotifications();
        if (result) {
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      alert('通知の設定に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Service Workerがサポートされていない場合は表示しない
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant={isSubscribed ? 'default' : 'outline'}
        className={`
          ${isSubscribed ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
          shadow-lg
        `}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            処理中...
          </span>
        ) : isSubscribed ? (
          <span className="flex items-center gap-2">
            🔔 通知ON
          </span>
        ) : (
          <span className="flex items-center gap-2">
            🔕 通知OFF
          </span>
        )}
      </Button>
    </div>
  );
};

