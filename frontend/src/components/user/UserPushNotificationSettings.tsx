import React, { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { apiService } from '../../services/api';

interface SubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export const UserPushNotificationSettings: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // プッシュ通知がサポートされているか確認
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    } else {
      setIsSupported(false);
      setIsChecking(false);
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      setIsChecking(true);
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    } finally {
      setIsChecking(false);
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
      const { publicKey } = await apiService.getUserVapidPublicKey();

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

      await apiService.subscribeUserPush(subscriptionData);

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
      await apiService.unsubscribeUserPush();

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

  if (isChecking) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">プッシュ通知設定</h2>
        <p className="text-gray-600">読み込み中...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">プッシュ通知設定</h2>
      <p className="text-gray-600 mb-4">
        お気に入り登録した店舗の空き状況が更新されると、プッシュ通知でお知らせします。
      </p>
      <p className="text-sm text-gray-500 mb-6">
        ※ お気に入り登録している店舗の空き状況が変更された場合のみ通知が届きます。
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

