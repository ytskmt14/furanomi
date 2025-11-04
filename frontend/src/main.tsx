import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Service Worker登録（vite-plugin-pwaが自動的に処理）
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true, // 即座に新しいService Workerをアクティブにする
    onNeedRefresh() {
      // 新しいバージョンが利用可能になったら、自動的にリロード
      console.log('[Service Worker] New version available, reloading...');
      window.location.reload();
    },
    onOfflineReady() {
      console.log('[Service Worker] App ready to work offline');
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      // Service Worker登録後に更新をチェック
      if (registration) {
        // 定期的に更新をチェック（1時間ごと）
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
        
        // 新しいService Workerが利用可能になったら即座に更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新しいService Workerがインストールされたら、ページをリロード
                console.log('[Service Worker] New version installed, reloading...');
                window.location.reload();
              }
            });
          }
        });
      }
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
