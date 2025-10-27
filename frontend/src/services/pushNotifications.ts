// プッシュ通知サービス

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// VAPID公開鍵の取得
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/vapid-public-key`);
    const data = await response.json();
    return data.publicKey || null;
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return null;
  }
}

// プッシュ通知の購読
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    // VAPID公開鍵を取得
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) {
      throw new Error('VAPID public key not available');
    }

    // 通知許可を求める
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });

    // 購読情報をサーバーに送信
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
      }
    };

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subscription: subscriptionData })
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe');
    }

    console.log('Subscribed to push notifications');
    return subscriptionData;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// プッシュ通知の購読解除
export async function unsubscribeFromPushNotifications(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/unsubscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint })
    });

    return response.ok;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// 現在の購読状態を確認
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return null;
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
      }
    };
  } catch (error) {
    console.error('Error getting current subscription:', error);
    return null;
  }
}

