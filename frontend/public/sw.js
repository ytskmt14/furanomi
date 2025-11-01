// Service Worker Version
const CACHE_VERSION = 'v1.0.3';
const CACHE_NAME = `furanomi-cache-${CACHE_VERSION}`;

// キャッシュ対象のリソース
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-128x128.svg',
  '/icon-256x256.svg',
  '/logo.svg',
  '/favicon-16x16.svg',
  '/favicon-32x32.svg'
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(STATIC_CACHE_FILES);
    })
  );
  
  self.skipWaiting();
});

// Service Worker アクティベート
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Network First 戦略：ネットワークから取得を試み、失敗したらキャッシュを使用
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 非GET（POST/PUT/DELETEなど）はそのままネットワークへ流す（キャッシュしない）
  if (request.method !== 'GET') {
    return; // 既定のfetch動作
  }

  // API リクエストは Network First（GET のみキャッシュ）
  if (request.url.includes('/api/') || request.url.includes('shops')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 正常レスポンスのみキャッシュ
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // JavaScript/CSSファイルは Network First（最新版を優先）
  if (request.url.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 正常レスポンスのみキャッシュ
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // その他の静的リソースは Cache First
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
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
    notification = {
      ...notification,
      ...event.data.json()
    };
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
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      return clients.openWindow(targetUrl);
    })()
  );
});

