import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ServiceWorkerInfo {
  registered: boolean;
  state: string | null;
  scope: string | null;
  updateViaCache: string | null;
  installing: boolean;
  waiting: boolean;
  active: boolean;
  error: string | null;
}

export const ServiceWorkerDebug: React.FC = () => {
  const [swInfo, setSwInfo] = useState<ServiceWorkerInfo>({
    registered: false,
    state: null,
    scope: null,
    updateViaCache: null,
    installing: false,
    waiting: false,
    active: false,
    error: null,
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    setLogs((prev) => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  const checkServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      setSwInfo((prev) => ({ ...prev, error: 'Service Workerはサポートされていません' }));
      addLog('Service Workerはサポートされていません');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        setSwInfo((prev) => ({
          ...prev,
          registered: false,
          state: '未登録',
          error: null,
        }));
        addLog('Service Workerは登録されていません');
        return;
      }

      const worker = registration.active || registration.waiting || registration.installing;
      const state = worker?.state || '不明';

      setSwInfo({
        registered: true,
        state,
        scope: registration.scope,
        updateViaCache: registration.updateViaCache || null,
        installing: !!registration.installing,
        waiting: !!registration.waiting,
        active: !!registration.active,
        error: null,
      });

      addLog(`Service Worker状態: ${state}, Scope: ${registration.scope}`);
    } catch (error: any) {
      setSwInfo((prev) => ({
        ...prev,
        error: error?.message || 'エラーが発生しました',
      }));
      addLog(`エラー: ${error?.message || '不明なエラー'}`);
    }
  };

  const unregisterServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      addLog('Service Workerはサポートされていません');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const success = await registration.unregister();
        if (success) {
          addLog('Service Workerの登録を解除しました');
          await checkServiceWorker();
        } else {
          addLog('Service Workerの解除に失敗しました');
        }
      } else {
        addLog('登録されているService Workerがありません');
      }
    } catch (error: any) {
      addLog(`解除エラー: ${error?.message || '不明なエラー'}`);
    }
  };

  const updateServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      addLog('Service Workerはサポートされていません');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        addLog('Service Workerの更新をチェックしました');
        setTimeout(() => checkServiceWorker(), 1000);
      } else {
        addLog('登録されているService Workerがありません');
      }
    } catch (error: any) {
      addLog(`更新エラー: ${error?.message || '不明なエラー'}`);
    }
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      addLog(`キャッシュをクリアしました (${cacheNames.length}件)`);
    } catch (error: any) {
      addLog(`キャッシュクリアエラー: ${error?.message || '不明なエラー'}`);
    }
  };

  useEffect(() => {
    checkServiceWorker();
    const interval = setInterval(checkServiceWorker, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Service Worker デバッグ情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">登録状態</div>
              <div className="text-lg font-semibold">
                {swInfo.registered ? (
                  <span className="text-green-600">✓ 登録済み</span>
                ) : (
                  <span className="text-red-600">✗ 未登録</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">状態</div>
              <div className="text-lg font-semibold">{swInfo.state || '不明'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-600">Scope</div>
              <div className="text-sm font-mono break-all">{swInfo.scope || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Installing</div>
              <div className={swInfo.installing ? 'text-green-600' : 'text-gray-400'}>
                {swInfo.installing ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Waiting</div>
              <div className={swInfo.waiting ? 'text-yellow-600' : 'text-gray-400'}>
                {swInfo.waiting ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Active</div>
              <div className={swInfo.active ? 'text-green-600' : 'text-gray-400'}>
                {swInfo.active ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">UpdateViaCache</div>
              <div className="text-sm">{swInfo.updateViaCache || '-'}</div>
            </div>
            {swInfo.error && (
              <div className="col-span-2">
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {swInfo.error}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button onClick={checkServiceWorker} variant="outline" size="sm">
              状態を更新
            </Button>
            <Button onClick={updateServiceWorker} variant="outline" size="sm">
              更新をチェック
            </Button>
            <Button onClick={unregisterServiceWorker} variant="outline" size="sm">
              登録解除
            </Button>
            <Button onClick={clearCache} variant="outline" size="sm">
              キャッシュクリア
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm font-semibold mb-2">操作ログ</div>
            <div className="bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-sm text-gray-400">ログがありません</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-gray-700 mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">環境情報</div>
            <div className="text-xs space-y-1">
              <div>User Agent: {navigator.userAgent}</div>
              <div>PWA Mode: {window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}</div>
              <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

