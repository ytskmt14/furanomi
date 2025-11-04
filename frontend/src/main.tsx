import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Service Worker登録（vite-plugin-pwaが自動的に処理）
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      // 新しいバージョンが利用可能になったら、ユーザーに通知するか自動リロード
      console.log('[Service Worker] New version available');
    },
    onOfflineReady() {
      console.log('[Service Worker] App ready to work offline');
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
