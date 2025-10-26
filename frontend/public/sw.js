// Service Worker Version
const CACHE_VERSION = 'v1.0.0';
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
  // API リクエストは Network First
  if (event.request.url.includes('/api/') || event.request.url.includes('shops')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 成功したらキャッシュに保存してから返す
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // ネットワーク失敗時はキャッシュから取得
          return caches.match(event.request);
        })
    );
  } else {
    // 静的リソースは Cache First
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
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
    clients.openWindow('/')
  );
});

