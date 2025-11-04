import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// アプリのバージョン（sw.tsのSW_VERSIONと同期すること）
const APP_VERSION = 'v1.0.8';

// PWAモードかどうかを判定
const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
              (window.navigator as any).standalone === true ||
              document.referrer.includes('android-app://');

console.log('[PWA] Mode:', isPWA ? 'PWA (standalone)' : 'Browser');
console.log('[PWA] User Agent:', navigator.userAgent);
console.log('[PWA] App Version:', APP_VERSION);

// グローバルエラーハンドラー（React error #300を含むすべてのエラーをキャッチ）
window.addEventListener('error', (event) => {
  console.error('[Global Error]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    isPWA,
    timestamp: new Date().toISOString()
  });

  // React error #300の場合、より詳細な情報を出力
  if (event.message && event.message.includes('Minified React error #300')) {
    console.error('[React Error #300 Detected]', {
      message: 'Suspense boundary error detected',
      suggestion: 'Visit https://react.dev/errors/300 for details',
      isPWA,
      workaround: 'Try reloading or reinstalling the PWA'
    });

    // PWAモードの場合、より積極的に回復を試みる
    if (isPWA) {
      console.log('[React Error #300] Attempting recovery...');
      // Service Workerを再登録
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          console.log('[React Error #300] Found', registrations.length, 'service workers');
        });
      }
    }
  }
});

// Promiseの未処理エラーもキャッチ
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', {
    reason: event.reason,
    promise: event.promise,
    isPWA,
    timestamp: new Date().toISOString()
  });
});

// iOS 18対策: アプリ起動時にすべてのキャッシュをクリア
async function clearAllCaches() {
  console.log('[Cache] Clearing all caches to prevent version mismatch...');
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`[Cache] Found ${cacheNames.length} caches:`, cacheNames);

      // Workboxのプリキャッシュ以外をすべて削除
      const deletePromises = cacheNames
        .filter((cacheName) => !cacheName.startsWith('workbox-precache'))
        .map((cacheName) => {
          console.log(`[Cache] Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        });

      await Promise.all(deletePromises);
      console.log('[Cache] All caches cleared successfully');
    }
  } catch (error) {
    console.error('[Cache] Failed to clear caches:', error);
  }
}

// 初期化処理（エラーハンドリング付き）
(async () => {
  try {
    // バージョン情報をログに出力（チェックのみ、リロードはしない）
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion && storedVersion !== APP_VERSION) {
      console.log(`[Version] Version updated: ${storedVersion} -> ${APP_VERSION}`);
      localStorage.setItem('app_version', APP_VERSION);
    } else if (!storedVersion) {
      console.log(`[Version] First time initialization: ${APP_VERSION}`);
      localStorage.setItem('app_version', APP_VERSION);
    } else {
      console.log(`[Version] Current version: ${APP_VERSION}`);
    }

    // キャッシュクリア（起動時に毎回実行、リロードはしない）
    await clearAllCaches();
  } catch (error) {
    // 初期化エラーが発生してもアプリは起動を続ける
    console.error('[Init] Initialization error (continuing anyway):', error);
  }
})();

// Service Worker登録（vite-plugin-pwaが自動的に処理）
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true, // 即座に新しいService Workerをアクティブにする
    onNeedRefresh() {
      // 新しいバージョンが利用可能になったら、キャッシュをクリアしてリロード
      console.log('[Service Worker] New version available, clearing caches and reloading...');
      clearAllCaches().then(() => {
        window.location.reload();
      });
    },
    onOfflineReady() {
      console.log('[Service Worker] App ready to work offline');
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      // Service Worker登録後に更新をチェック
      if (registration) {
        // iOS 18対策: Service Workerからのメッセージを受信
        navigator.serviceWorker.addEventListener('message', async (event) => {
          if (event.data && event.data.type === 'SW_ACTIVATED') {
            console.log(`[Service Worker] New version activated (${event.data.version})`);

            if (event.data.reload) {
              // キャッシュをクリアしてからリロード
              await clearAllCaches();
              console.log('[Service Worker] Caches cleared, reloading...');
              // 少し待ってからリロード（確実にキャッシュクリアが完了するまで）
              setTimeout(() => {
                window.location.reload();
              }, 200);
            }
          }
        });

        // 定期的に更新をチェック（1時間ごと）
        setInterval(() => {
          console.log('[Service Worker] Checking for updates...');
          registration.update();
        }, 60 * 60 * 1000);

        // 新しいService Workerが利用可能になったら即座に更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('[Service Worker] Update found, installing new version...');

            newWorker.addEventListener('statechange', async () => {
              console.log(`[Service Worker] New worker state: ${newWorker.state}`);

              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // 既存のService Workerがある場合は、新しいバージョンに更新
                  console.log('[Service Worker] New version installed, clearing caches...');
                  await clearAllCaches();

                  // skipWaitingを促す（sw.tsで自動的に実行されるが念のため）
                  newWorker.postMessage({ type: 'SKIP_WAITING' });

                  // リロードして新しいService Workerをアクティブにする
                  setTimeout(() => {
                    console.log('[Service Worker] Reloading to activate new version...');
                    window.location.reload();
                  }, 300);
                } else {
                  // 初回インストール
                  console.log('[Service Worker] First time installation complete');
                }
              }
            });
          }
        });

        // 初回チェック
        console.log('[Service Worker] Registered, checking for updates...');
        registration.update();
      }
    },
  });
}

// React 19のStrictModeはiOS 18 PWAでReact error #300を引き起こす可能性があるため、
// 本番環境では無効化（開発環境では有効のまま）
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const app = import.meta.env.DEV ? (
  <StrictMode>
    <App />
  </StrictMode>
) : (
  <App />
);

createRoot(rootElement).render(app);
