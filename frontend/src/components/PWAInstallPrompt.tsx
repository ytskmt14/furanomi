import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// iOSかどうかを判定
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone === true;

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isStandalone);

  useEffect(() => {
    // PWAが既にインストールされているか確認
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Android/Chrome向け: beforeinstallprompt イベントをキャプチャ
    if (!isIOS) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // appinstalledイベント（インストール完了時に発火）
      const handleAppInstalled = () => {
        // インストール時のURLパスを保存（タイムスタンプ付き）
        const currentPath = window.location.pathname;
        const pathData = {
          path: currentPath,
          timestamp: Date.now()
        };
        localStorage.setItem('pwa-install-path', JSON.stringify(pathData));
        console.log('[PWA] Installation path saved:', currentPath);
        setIsInstalled(true);
        setShowPrompt(false);
      };

      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } else {
      // iOS向け: 手動でインストール手順を案内
      // Safariで表示された場合のみプロンプトを表示
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          // 3秒後にプロンプトを表示（ユーザーがページを読む時間を与える）
          const timer = setTimeout(() => {
            setShowPrompt(true);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOSの場合は手順を表示
      // この時点でURLパスを保存（ユーザーがインストール手順を見ている時点）
      const currentPath = window.location.pathname;
      const pathData = {
        path: currentPath,
        timestamp: Date.now()
      };
      localStorage.setItem('pwa-install-path', JSON.stringify(pathData));
      console.log('[PWA] iOS: Path saved when showing instructions:', currentPath);
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    // インストール時のURLパスを事前に保存（タイムスタンプ付き）
    const currentPath = window.location.pathname;
    const pathData = {
      path: currentPath,
      timestamp: Date.now()
    };
    localStorage.setItem('pwa-install-path', JSON.stringify(pathData));
    console.log('[PWA] Installation path saved before prompt:', currentPath);

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    // 24時間は表示しない
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // インストール済みの場合は表示しない
  if (isInstalled) return null;

  // 24時間以内に非表示にした場合は表示しない
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < twentyFourHours) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt && !showIOSInstructions) return null;

  // iOS向けのインストール手順を表示
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-start gap-3 mb-4">
            <img src="/icon-128x128.svg" alt="ふらのみ" className="w-12 h-12 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">ホーム画面に追加</h3>
              <p className="text-sm text-gray-600 mb-4">
                iOS Safariでアプリをホーム画面に追加する方法：
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>画面下部の<strong>共有</strong>ボタン（□↑）をタップ</li>
                <li>メニューから<strong>「ホーム画面に追加」</strong>を選択</li>
                <li>右上の<strong>「追加」</strong>をタップ</li>
              </ol>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleDismiss}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <img src="/icon-128x128.svg" alt="ふらのみ" className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">アプリをインストール</h3>
            <p className="text-sm text-gray-600 mb-3">
              ホーム画面に追加して、プッシュ通知を受け取れるようにしましょう
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isIOS ? '手順を見る' : 'インストール'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                後で
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

