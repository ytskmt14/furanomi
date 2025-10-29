import React, { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

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
  const { toast } = useToast();

  useEffect(() => {
    // プッシュ通知がサポートされているか確認
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    } else {
      setIsSupported(false);
    }
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

      // VAPID公開鍵を取得
      const publicKeyResponse = await fetch(`${API_BASE_URL}/notifications/vapid-public-key`);
      if (!publicKeyResponse.ok) {
        throw new Error('Failed to get VAPID public key');
      }
      const { publicKey } = await publicKeyResponse.json();

      // プッシュ通知の購読
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

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
        throw new Error('Failed to subscribe');
      }

      setIsSubscribed(true);
      toast({
        title: '購読完了',
        description: 'プッシュ通知を有効にしました',
      });
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      toast({
        title: '購読失敗',
        description: error.message || 'プッシュ通知の設定に失敗しました',
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

