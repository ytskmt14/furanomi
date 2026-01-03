import React, { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { apiService } from '../../services/api';


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

      // 通知許可の状態を確認
      if ('Notification' in window) {
        const permission = Notification.permission;
        if (permission === 'denied') {
          throw new Error('通知が拒否されています。ブラウザの設定から通知を許可してください。\n\n設定方法:\n1. ブラウザの設定を開く\n2. サイトの設定またはプライバシー設定を開く\n3. 通知の設定でこのサイトを許可\n4. ページをリロードして再度お試しください');
        }
        if (permission === 'default') {
          // 通知許可をリクエスト
          const result = await Notification.requestPermission();
          if (result === 'denied') {
            throw new Error('通知の許可が必要です。ブラウザの設定から通知を許可してください。');
          }
          if (result === 'default') {
            throw new Error('通知の許可が必要です。ブラウザの設定から通知を許可してください。');
          }
        }
      }

      // Service Workerの登録を確認
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        // Service Workerを登録
        try {
          registration = await navigator.serviceWorker.register('/sw.js');
          // 登録後にreadyになるまで待つ
          registration = await navigator.serviceWorker.ready;
        } catch (swError: any) {
          console.error('Service Worker registration error:', swError);
          if (swError.message && swError.message.includes('permission')) {
            throw new Error('Service Workerの登録に失敗しました。ブラウザの設定を確認してください。');
          }
          throw new Error('Service Workerが登録されていません。ページをリロードしてください。');
        }
      }

      // Service Workerがreadyになるまで待つ
      registration = await navigator.serviceWorker.ready;
      if (!registration) {
        throw new Error('Service Workerが準備できていません。ページをリロードしてください。');
      }

      // VAPID公開鍵を取得
      let publicKey: string;
      try {
        const response = await apiService.getShopManagerVapidPublicKey();
        publicKey = response.publicKey;
      } catch (error: any) {
        if (error.status === 503) {
          throw new Error('VAPID公開鍵が設定されていません。システム管理者にご連絡ください。');
        }
        throw new Error('VAPID公開鍵の取得に失敗しました');
      }

      if (!publicKey) {
        throw new Error('VAPID公開鍵が設定されていません。システム管理者にご連絡ください。');
      }

      // 既存の購読を確認
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        // 新しい購読を作成
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
          });
        } catch (subscribeError: any) {
          console.error('Push subscription error:', subscribeError);
          if (subscribeError.name === 'NotAllowedError' || subscribeError.message?.includes('permission')) {
            throw new Error('通知の許可が必要です。ブラウザの設定から通知を許可してください。\n\n設定方法:\n1. ブラウザの設定を開く\n2. サイトの設定またはプライバシー設定を開く\n3. 通知の設定でこのサイトを許可\n4. ページをリロードして再度お試しください');
          }
          if (subscribeError.name === 'NotSupportedError') {
            throw new Error('プッシュ通知がサポートされていません。HTTPS接続が必要な場合があります。');
          }
          throw new Error(`購読に失敗しました: ${subscribeError.message || subscribeError.name || '不明なエラー'}`);
        }
      }

      // バックエンドに購読情報を送信
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      await apiService.subscribeShopManagerPush(subscriptionData);

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
        errorMessage = '通知の許可が必要です。ブラウザの設定から通知を許可してください。';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'プッシュ通知がサポートされていません。';
      } else if (error.message?.includes('permission denied') || error.message?.includes('permission')) {
        errorMessage = '通知の許可が必要です。ブラウザの設定から通知を許可してください。\n\n設定方法:\n1. ブラウザの設定を開く\n2. サイトの設定またはプライバシー設定を開く\n3. 通知の設定でこのサイトを許可\n4. ページをリロードして再度お試しください';
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
      await apiService.unsubscribeShopManagerPush();

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

