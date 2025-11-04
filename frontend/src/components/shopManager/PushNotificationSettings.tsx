import React, { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { apiService } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface SubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export const PushNotificationSettings: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // プッシュ通知がサポートされているか確認
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    } else {
      setIsSupported(false);
    }

    // 店舗情報と予約機能の状態を取得
    const fetchShopAndFeatures = async () => {
      try {
        const shopData = await apiService.getMyShop();
        const featuresResponse = await apiService.getShopFeatures(shopData.id);
        setReservationEnabled(featuresResponse.features.reservation === true);
      } catch (error) {
        console.error('Failed to fetch shop features:', error);
      }
    };
    fetchShopAndFeatures();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      setIsLoading(true);

      // Service Workerが登録されているか確認
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workerがサポートされていません');
      }

      // VAPID公開鍵を取得
      const publicKeyResponse = await fetch(`${API_BASE_URL}/notifications/vapid-public-key`);
      if (!publicKeyResponse.ok) {
        throw new Error('VAPID公開鍵の取得に失敗しました');
      }
      const { publicKey } = await publicKeyResponse.json();

      if (!publicKey) {
        throw new Error('VAPID公開鍵が設定されていません');
      }

      // プッシュ通知の購読
      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        throw new Error('Service Workerが登録されていません。ページをリロードしてください。');
      }

      // 既存の購読を確認
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        // 新しい購読を作成
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey
        });
      }

      // バックエンドに購読情報を送信
      const subscriptionData: SubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
      };

      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        credentials: 'include',
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '購読情報の保存に失敗しました');
      }

      setIsSubscribed(true);
      toast({
        title: '購読完了',
        description: 'プッシュ通知を有効にしました',
      });
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      let errorMessage = 'プッシュ通知の設定に失敗しました';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'NotAllowedError') {
        errorMessage = '通知の許可が必要です。ブラウザの設定を確認してください。';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'プッシュ通知がサポートされていません。';
      }
      
      toast({
        title: '購読失敗',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    try {
      setIsLoading(true);

      // ローカルの購読を解除
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // バックエンドから購読情報を削除
      const response = await fetch(`${API_BASE_URL}/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          credentials: 'include'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      setIsSubscribed(false);
      toast({
        title: '購読解除完了',
        description: 'プッシュ通知を無効にしました',
      });
    } catch (error: any) {
      console.error('Failed to unsubscribe:', error);
      toast({
        title: '購読解除失敗',
        description: error.message || 'プッシュ通知の解除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">プッシュ通知設定</h2>
        <p className="text-gray-600">お使いのブラウザはプッシュ通知をサポートしていません。</p>
      </Card>
    );
  }

  if (!reservationEnabled) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">プッシュ通知設定</h2>
        <p className="text-gray-600">予約機能が有効になっている場合のみ、プッシュ通知をご利用いただけます。</p>
        <p className="text-sm text-gray-500 mt-2">
          予約機能を有効にするには、システム管理者にお問い合わせください。
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">プッシュ通知設定</h2>
      <p className="text-gray-600 mb-6">
        予約が入るとプッシュ通知でお知らせします。
      </p>
      
      {isSubscribed ? (
        <div>
          <p className="text-green-600 mb-4">✓ プッシュ通知が有効です</p>
          <Button
            onClick={unsubscribeFromPushNotifications}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? '処理中...' : '通知を無効にする'}
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">プッシュ通知は現在無効です</p>
          <Button
            onClick={subscribeToPushNotifications}
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : '通知を有効にする'}
          </Button>
        </div>
      )}
    </Card>
  );
};

