/// <reference lib="webworker" />
import { clientsClaim, skipWaiting } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// 即座に新しいService Workerをアクティブにする
skipWaiting();
// クライアントクレームを有効化（即座にService Workerをアクティブにする）
clientsClaim();

// プリキャッシュとルーティングを設定
precacheAndRoute(self.__WB_MANIFEST);

// キャッシュ戦略の設定
// JS/CSSファイルはNetwork First（最新版を優先）
// iOS Safariでのキャッシュ問題を回避するため、より積極的にネットワークから取得
registerRoute(
  ({ url }) => url.pathname.match(/\.(js|css)$/) && url.origin === self.location.origin,
  new NetworkFirst({
    cacheName: 'js-css-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20, // エントリ数を減らしてキャッシュを小さく保つ
        maxAgeSeconds: 60 * 60 * 24, // 1日に短縮（iOS Safari対策）
        purgeOnQuotaError: true, // クォータエラー時にキャッシュをクリア
      }),
    ],
    networkTimeoutSeconds: 3, // タイムアウトを短く設定（すぐにネットワークから取得）
  })
);

// APIリクエストはNetwork First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 5, // 5分
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

// 画像ファイルはCache First
registerRoute(
  ({ url }) => url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/),
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
      }),
    ],
  })
);

// プッシュ通知受信
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received', event);
  
  let notification = {
    title: 'ふらのみ',
    body: '店舗の空き状況が更新されました',
    icon: '/icon-128x128.svg',
    badge: '/icon-128x128.svg',
    data: {}
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      notification = {
        ...notification,
        ...pushData
      };
    } catch (e) {
      // JSON解析に失敗した場合はデフォルト値を使用
      console.error('Failed to parse push data:', e);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked', event);
  
  event.notification.close();
  
  event.waitUntil(
    (async () => {
      const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      return self.clients.openWindow(targetUrl);
    })()
  );
});

