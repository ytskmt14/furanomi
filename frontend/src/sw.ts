/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Service Workerのバージョン（キャッシュ名に含める）
// main.tsxのAPP_VERSIONと同期すること
const SW_VERSION = 'v1.0.7';

// 古いキャッシュをクリーンアップ
cleanupOutdatedCaches();

// 即座に新しいService Workerをアクティブにする
self.skipWaiting();

// クライアントからのメッセージを受信（skipWaitingリクエスト）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// クライアントクレームを有効化（即座にService Workerをアクティブにする）
clientsClaim();

// Service Workerアクティベート時に古いキャッシュをすべてクリア
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Activating version ${SW_VERSION}...`);

  event.waitUntil(
    (async () => {
      // 即座にすべてのクライアントをクレーム
      await self.clients.claim();
      console.log('[Service Worker] Claimed all clients');
      // 現在のキャッシュ名のリストを取得
      const currentCacheNames = [
        `html-cache-${SW_VERSION}`,
        `js-css-cache-${SW_VERSION}`,
        `api-cache-${SW_VERSION}`,
        `image-cache-${SW_VERSION}`,
      ];
      
      // すべてのキャッシュを取得
      const cacheNames = await caches.keys();
      console.log(`[Service Worker] Found ${cacheNames.length} caches:`, cacheNames);
      
      // 古いキャッシュ（現在のバージョン以外のキャッシュ）を削除
      const deletePromises = cacheNames
        .filter((cacheName) => {
          // 現在のバージョンのキャッシュは保持
          if (currentCacheNames.includes(cacheName)) {
            return false;
          }
          // Workboxのプリキャッシュも保持（cleanupOutdatedCachesで処理される）
          if (cacheName.startsWith('workbox-precache')) {
            return false;
          }
          // その他の古いキャッシュを削除
          return true;
        })
        .map((cacheName) => {
          console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
          return caches.delete(cacheName);
        });
      
      await Promise.all(deletePromises);
      
      // Chrome/iOS 18対策: すべてのキャッシュからHTML/JS/CSSファイルを削除
      // 異なるバージョンのファイルが混在することを防ぐ
      for (const cacheName of cacheNames) {
        try {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          const htmlJsCssKeys = keys.filter((request) => {
            const url = new URL(request.url);
            return (
              url.pathname === '/' ||
              url.pathname.endsWith('.html') ||
              url.pathname.endsWith('.js') ||
              url.pathname.endsWith('.css')
            );
          });
          await Promise.all(htmlJsCssKeys.map((key) => cache.delete(key)));
          if (htmlJsCssKeys.length > 0) {
            console.log(`[Service Worker] Cleared ${htmlJsCssKeys.length} HTML/JS/CSS files from ${cacheName}`);
          }
        } catch (error) {
          console.warn(`[Service Worker] Failed to clear cache ${cacheName}:`, error);
        }
      }
      
      // さらに、すべてのキャッシュを削除（Workboxのプリキャッシュを除く）
      // より確実に古いファイルを削除
      const allDeletePromises = cacheNames
        .filter((cacheName) => !cacheName.startsWith('workbox-precache'))
        .map((cacheName) => {
          console.log(`[Service Worker] Deleting all files from cache: ${cacheName}`);
          return caches.delete(cacheName);
        });
      
      await Promise.all(allDeletePromises);
      console.log(`[Service Worker] All caches cleared (except workbox-precache). Current version: ${SW_VERSION}`);
      
      // すべてのクライアントにService Workerがアクティブになったことを通知し、ページをリロード
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION,
          reload: true, // iOS 18対策: 強制的にリロード
        });
      });
    })()
  );
});

// プリキャッシュとルーティングを設定
precacheAndRoute(self.__WB_MANIFEST);

// キャッシュ戦略の設定
// HTMLファイル（特にindex.html）はNetwork Only（キャッシュを一切使わない）
// iOS 18対策: 常に最新のindex.htmlを取得して、古いJSファイルへの参照を防ぐ
registerRoute(
  ({ url }) => (url.pathname === '/' || url.pathname.endsWith('.html')) && url.origin === self.location.origin,
  async ({ request }) => {
    // キャッシュを完全にバイパスしてネットワークから取得
    // iOS 18では、キャッシュされたindex.htmlが古いJSファイルを参照する可能性がある
    try {
      const response = await fetch(request, { cache: 'no-store' });
      console.log(`[Service Worker] HTML fetched from network (no-cache): ${new URL(request.url).pathname}`);
      return response;
    } catch (error) {
      console.error(`[Service Worker] Failed to fetch HTML: ${new URL(request.url).pathname}`, error);
      throw error;
    }
  }
);

// JS/CSSファイルはNetwork Only（キャッシュを一切使わない）
// ChromeでもReact error #300が発生するため、キャッシュを完全に無効化
// 異なるバージョンのJSファイルが混在することを防ぐ
registerRoute(
  ({ url }) => url.pathname.match(/\.(js|css)$/) && url.origin === self.location.origin,
  async ({ request }) => {
    // キャッシュを完全にバイパスしてネットワークから取得
    // 古いJSファイルが読み込まれることを防ぐ
    try {
      const response = await fetch(request, { cache: 'no-store' });
      console.log(`[Service Worker] JS/CSS fetched from network (no-cache): ${new URL(request.url).pathname}`);
      return response;
    } catch (error) {
      console.error(`[Service Worker] Failed to fetch JS/CSS: ${new URL(request.url).pathname}`, error);
      throw error;
    }
  }
);

// APIリクエストはNetwork First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: `api-cache-${SW_VERSION}`,
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
    cacheName: `image-cache-${SW_VERSION}`,
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

