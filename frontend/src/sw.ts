/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

// Workboxのマニフェストを注入（ビルド時に自動生成される）
// injectManifest戦略を使用する場合、この参照が必要
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Service Workerのバージョン（main.tsxのAPP_VERSIONと同期すること）
const SW_VERSION = 'v1.0.10';

// 古いキャッシュをクリーンアップ
cleanupOutdatedCaches();

// プリキャッシュマニフェストを設定（Workboxがビルド時に注入）
// オフライン機能は優先度が低いため、プリキャッシュは設定するが、フェッチハンドラーでは使用しない
precacheAndRoute(self.__WB_MANIFEST);

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

// Service Workerアクティベート時の処理
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Activating version ${SW_VERSION}...`);

  event.waitUntil(
    (async () => {
      // 即座にすべてのクライアントをクレーム
      await self.clients.claim();
      console.log('[Service Worker] Claimed all clients');
      
      // 古いキャッシュを削除（Workboxのプリキャッシュは保持）
      try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter((cacheName) => !cacheName.startsWith('workbox-precache'))
          .map((cacheName) => {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          });
        await Promise.all(deletePromises);
      } catch (error) {
        console.warn('[Service Worker] Failed to clean up caches:', error);
      }
      
      // すべてのクライアントにService Workerがアクティブになったことを通知
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION,
          reload: true,
        });
      });
      
      console.log(`[Service Worker] Activated version ${SW_VERSION}`);
    })()
  );
});

// すべてのリクエストをネットワークから取得（オフライン機能は最小限）
// プッシュ通知機能に焦点を当てるため、キャッシュ戦略を簡素化
self.addEventListener('fetch', (event) => {
  // ネットワークから直接取得（キャッシュは使用しない）
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.error('[Service Worker] Fetch failed:', error);
      // オフライン時はエラーを返す（オフライン機能は優先度低）
      throw error;
    })
  );
});

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
    (async () => {
      // 通知を表示
      await self.registration.showNotification(notification.title, notification);
      
      // アプリアイコンにバッジを設定（ドット表示）
      if ('setAppBadge' in navigator) {
        try {
          await (navigator as any).setAppBadge();
          console.log('[Service Worker] Badge set on push notification');
        } catch (error) {
          console.warn('[Service Worker] Failed to set badge:', error);
        }
      }
    })()
  );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked', event);
  
  event.notification.close();
  
  event.waitUntil(
    (async () => {
      // アプリアイコンのバッジをクリア
      if ('clearAppBadge' in navigator) {
        try {
          await (navigator as any).clearAppBadge();
          console.log('[Service Worker] Badge cleared on notification click');
        } catch (error) {
          console.warn('[Service Worker] Failed to clear badge:', error);
        }
      }
      
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

