import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Service Worker登録
if ('serviceWorker' in navigator) {
  // PWAとして起動した場合も早期にService Workerを登録
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[Service Worker] Registered:', registration.scope);
        
        // 新しいService Workerが利用可能になったら、強制的に更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新しいService Workerがインストールされたら、ページをリロード
                console.log('[Service Worker] New version available, reloading...');
                window.location.reload();
              }
            });
          }
        });
        
        // 定期的にService Workerをチェック（1時間ごと）
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('[Service Worker] Registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
