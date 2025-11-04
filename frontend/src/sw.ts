/// <reference lib="webworker" />
import { clientsClaim, skipWaiting } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import type { WorkboxPlugin } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

// デバッグ用プラグイン: どのファイルが読み込まれているかをログ出力
class DebugLoggingPlugin implements WorkboxPlugin {
  pluginName = 'DebugLoggingPlugin';
  
  fetchDidSucceed = async ({ request, response }: { request: Request; response: Response }) => {
    const url = new URL(request.url);
    console.log(`[Service Worker] Fetched from network: ${url.pathname} (${response.status})`);
    return response;
  };
  
  cacheDidUpdate = async ({ request }: { request: Request; oldResponse?: Response | null; newResponse: Response }) => {
    const url = new URL(request.url);
    console.log(`[Service Worker] Cache updated: ${url.pathname}`);
  };
  
  cacheWillMatch = async ({ request, cachedResponse }: { request: Request; cachedResponse?: Response | null }) => {
    if (cachedResponse) {
      const url = new URL(request.url);
      console.log(`[Service Worker] Using cached response: ${url.pathname}`);
    }
    return cachedResponse || undefined;
  };
}

// Service Workerのバージョン（キャッシュ名に含める）
const SW_VERSION = 'v1.0.4';

// 古いキャッシュをクリーンアップ
cleanupOutdatedCaches();

// 即座に新しいService Workerをアクティブにする
skipWaiting();
// クライアントクレームを有効化（即座にService Workerをアクティブにする）
clientsClaim();

// Service Workerアクティベート時に古いキャッシュをすべてクリア
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Activating version ${SW_VERSION}...`);
  
  event.waitUntil(
    (async () => {
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
      console.log(`[Service Worker] Old caches cleared. Current version: ${SW_VERSION}`);
      
      // すべてのクライアントにService Workerがアクティブになったことを通知
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION,
        });
      });
    })()
  );
});

// プリキャッシュとルーティングを設定
precacheAndRoute(self.__WB_MANIFEST);

// キャッシュ戦略の設定
// HTMLファイル（特にindex.html）はNetwork First（最新版を優先）
// プリキャッシュから除外しているため、このルートが適用される
// iOS Safariでのキャッシュ問題を回避するため、ネットワークを最優先
registerRoute(
  ({ url }) => (url.pathname === '/' || url.pathname.endsWith('.html')) && url.origin === self.location.origin,
  new NetworkFirst({
    cacheName: `html-cache-${SW_VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 5, // エントリ数を少なく設定
        maxAgeSeconds: 60 * 5, // 5分に短縮（iOS Safari対策）
        purgeOnQuotaError: true, // クォータエラー時にキャッシュをクリア
      }),
      new DebugLoggingPlugin(), // デバッグログ用プラグイン
    ],
    // タイムアウトを設定しない（デフォルト動作：ネットワークを優先）
    // ネットワークが失敗した場合のみキャッシュを使用
  })
);

// JS/CSSファイルはNetwork First（最新版を優先）
// プリキャッシュから除外しているため、このルートが適用される
// iOS Safariでのキャッシュ問題を回避するため、ネットワークを最優先
registerRoute(
  ({ url }) => url.pathname.match(/\.(js|css)$/) && url.origin === self.location.origin,
  new NetworkFirst({
    cacheName: `js-css-cache-${SW_VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10, // エントリ数をさらに減らす
        maxAgeSeconds: 60 * 5, // 5分に短縮（iOS Safari対策）
        purgeOnQuotaError: true, // クォータエラー時にキャッシュをクリア
      }),
      new DebugLoggingPlugin(), // デバッグログ用プラグイン
    ],
    // タイムアウトを設定しない（デフォルト動作：ネットワークを優先）
    // ネットワークが失敗した場合のみキャッシュを使用
  })
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

