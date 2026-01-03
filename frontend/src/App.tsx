import { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ShopList } from './components/ShopList';
import { MapView } from './components/MapView';
import { SearchModal } from './components/SearchModal';
import { FloatingSearchButton } from './components/FloatingSearchButton';
import { LoadingList } from './components/Loading';
import { ErrorBoundary, ErrorMessage, NoSearchResults } from './components/ErrorHandling';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { apiService } from './services/api';
import { Shop } from './types/shop';
import { Button } from './components/ui/button';
import { List, Map } from 'lucide-react';
import { Toaster } from './components/ui/toaster';
import { UserProfile } from './components/auth/UserProfile';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ServiceWorkerDebug } from './components/ServiceWorkerDebug';
import { queryClient } from './lib/queryClient';

// Code Splitting: 管理画面を遅延ロード
// chunk読み込みエラー時にリトライする仕組みを追加
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        console.warn(`[Lazy Load] Attempt ${i + 1}/${maxRetries} failed:`, error);

        // 最後の試行でエラーになった場合
        if (i === maxRetries - 1) {
          console.error('[Lazy Load] All retry attempts failed, reloading page...');
          // chunkの読み込みエラーの場合、ページをリロードして新しいchunkを取得
          if (error instanceof Error && (
            error.message.includes('Failed to fetch') ||
            error.message.includes('Importing a module') ||
            error.name === 'ChunkLoadError'
          )) {
            window.location.reload();
          }
          throw error;
        }

        // 次の試行前に少し待つ
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Failed to load component after retries');
  });

const ShopManagerApp = lazyWithRetry(() => import('./components/shopManager/ShopManagerApp'));
const SystemAdminApp = lazyWithRetry(() => import('./components/systemAdmin/SystemAdminApp'));
const StaffAvailabilityUpdate = lazyWithRetry(() => import('./components/staff/StaffAvailabilityUpdate'));
const MyReservations = lazyWithRetry(() => import('./components/reservation/MyReservations'));

// アプリ起動時にバッジをクリア
const AppBadgeManager: React.FC = () => {
  useEffect(() => {
    // アプリ起動時にアプリアイコンのバッジをクリア
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge().catch((error: Error) => {
        console.warn('[App] Failed to clear badge on app start:', error);
      });
    }
  }, []);
  
  return null;
};

// 利用者用アプリ
const UserApp: React.FC = () => {
  // 店舗詳細モーダルは廃止
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleShopSelect = useCallback((_shop: Shop) => {
    // modal削除に伴い何もしない
  }, []);

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleFilteredShops = useCallback((shops: Shop[]) => {
    setFilteredShops(shops);
  }, []);

  const handleRetry = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    await loadShops();
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilteredShops(shops);
  }, [shops]);

  // 位置情報を取得
  const getUserLocation = useCallback((): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('位置情報がサポートされていません'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (_error) => {
          reject(new Error('位置情報の取得に失敗しました'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5分
        }
      );
    });
  }, []);

  // 店舗データを読み込み（依存配列を空にして、初回のみ実行）
  const loadShops = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 位置情報を取得してから店舗を検索
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        
        // 位置情報ベースで店舗を検索
        const response = await apiService.searchShopsByLocation(location.lat, location.lng);
        setShops(response.shops || []);
        setFilteredShops(response.shops || []);
      } catch (locationError) {
        console.warn('位置情報の取得に失敗、全店舗を表示:', locationError);
        
        // 位置情報が取得できない場合は全店舗を表示
        try {
          const response = await apiService.getShops();
          setShops(response.shops || []);
          setFilteredShops(response.shops || []);
        } catch (shopsError) {
          console.error('店舗データの取得に失敗:', shopsError);
          setError(shopsError instanceof Error ? shopsError.message : '店舗データの読み込みに失敗しました');
        }
      }
    } catch (err) {
      console.error('店舗データの読み込みに失敗:', err);
      setError(err instanceof Error ? err.message : '店舗データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [getUserLocation]); // getUserLocationを依存配列に追加

  // 初期データ読み込み（初回のみ実行）
  useEffect(() => {
    loadShops();
  }, [loadShops]); // loadShopsを依存配列に追加

  // メモ化されたコンポーネント
  const shopListComponent = useMemo(() => (
    <ShopList shops={filteredShops} />
  ), [filteredShops]);

  const mapViewComponent = useMemo(() => (
    <MapView 
      shops={filteredShops} 
      userLocation={userLocation}
      onShopSelect={handleShopSelect} 
    />
  ), [filteredShops, userLocation, handleShopSelect]);

  return (
    <Layout userLocation={userLocation}>
        <div className="w-full">
        <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 text-sm sm:text-sm font-medium rounded-lg transition-all duration-200 flex-1 sm:flex-initial min-h-[44px] touch-manipulation ${
              viewMode === 'list' 
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm' 
                : 'bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-700 shadow-sm'
            }`}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2"><List className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">リスト</span><span className="xs:hidden">一覧</span></span>
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
            className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 text-sm sm:text-sm font-medium rounded-lg transition-all duration-200 flex-1 sm:flex-initial min-h-[44px] touch-manipulation ${
              viewMode === 'map' 
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm' 
                : 'bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-700 shadow-sm'
            }`}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2"><Map className="w-4 h-4 sm:w-5 sm:h-5" /> 地図</span>
          </Button>
        </div>

        {isLoading ? (
          <LoadingList count={6} />
        ) : error ? (
          <ErrorMessage 
            message={error} 
            onRetry={handleRetry}
          />
        ) : filteredShops.length === 0 ? (
          <NoSearchResults onClearFilters={handleClearFilters} />
        ) : (
          <>
            {viewMode === 'list' ? (
              shopListComponent
            ) : (
              mapViewComponent
            )}
          </>
        )}

        {/* 店舗詳細モーダルは削除 */}

        <SearchModal
          isOpen={isSearchOpen}
          onClose={handleSearchClose}
          shops={shops}
          onFilteredShops={handleFilteredShops}
        />

        <FloatingSearchButton onClick={handleSearchOpen} />
        
        {/* PWAインストールプロンプト（利用者アプリのみ） */}
        <PWAInstallPrompt />
      </div>
    </Layout>
  );
};

// メインアプリケーション
// 環境変数のチェック
const checkEnvironmentVariables = () => {
  const requiredEnvVars = [
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_API_BASE_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => {
    const value = import.meta.env[varName];
    // プレースホルダーや開発環境の値（localhostなど）は有効として扱う
    return !value || value.includes('YOUR_') || value.includes('REPLACE');
  });
  
  if (missingVars.length > 0) {
    console.error('Missing or invalid environment variables:', missingVars);
    return false;
  }
  
  return true;
};

// PWA起動時のリダイレクト処理コンポーネント
const PWARootRedirect: React.FC = () => {
  useEffect(() => {
    // PWAとして起動した場合（standaloneモード）かつルート（/）にアクセスした場合
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
    
    // document.referrerが空（PWA起動時）またはreferrerが同じオリジンでない場合
    const isPWALaunch = !document.referrer || !document.referrer.startsWith(window.location.origin);
    
    if (isStandalone && isPWALaunch) {
      // インストール時に記録されたURLパスを取得（タイムスタンプ付き）
      const installPathData = localStorage.getItem('pwa-install-path');
      
      if (installPathData) {
        try {
          const { path, timestamp } = JSON.parse(installPathData);
          if (path && path !== '/') {
            // 24時間以内のパスのみ有効
            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (now - timestamp < twentyFourHours) {
              console.log('[PWA] Redirecting to installation path:', path);
              // window.location.replace()を使用してリダイレクト（React Routerの外で実行）
              window.location.replace(path);
              return;
            } else {
              // 24時間以上経過している場合は削除
              localStorage.removeItem('pwa-install-path');
            }
          }
        } catch (e) {
          // 古い形式（文字列のみ）の場合は、そのまま使用
          const oldPath = installPathData;
          if (oldPath && oldPath !== '/') {
            console.log('[PWA] Redirecting to installation path (legacy format):', oldPath);
            window.location.replace(oldPath);
            return;
          }
        }
      }
    }
  }, []);
  
  // デフォルトは利用者用アプリ（リダイレクトしない場合）
  return <Navigate to="/user" replace />;
};

function App() {
  const [envCheckPassed, setEnvCheckPassed] = useState(true);
  
  // PWA起動時のリダイレクト処理（Routerの前に実行）
  // PWAとして起動した場合（standaloneモード）かつルート（/）にアクセスした場合
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
  const isPWALaunch = !document.referrer || !document.referrer.startsWith(window.location.origin);
  const currentPath = window.location.pathname;
  
  // デバッグ用ログ
  console.log('[PWA] App component - isStandalone:', isStandalone);
  console.log('[PWA] App component - isPWALaunch:', isPWALaunch);
  console.log('[PWA] App component - currentPath:', currentPath);
  console.log('[PWA] App component - document.referrer:', document.referrer);
  
  if (isStandalone && isPWALaunch && currentPath === '/') {
    const installPathData = localStorage.getItem('pwa-install-path');
    console.log('[PWA] App component - installPathData:', installPathData);
    
    if (installPathData) {
      try {
        const { path, timestamp } = JSON.parse(installPathData);
        console.log('[PWA] App component - parsed path:', path, 'timestamp:', timestamp);
        
        if (path && path !== '/') {
          // 24時間以内のパスのみ有効
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          const timeDiff = now - timestamp;
          
          console.log('[PWA] App component - timeDiff (hours):', timeDiff / (60 * 60 * 1000));
          
          if (timeDiff < twentyFourHours) {
            console.log('[PWA] Redirecting to installation path:', path);
            // window.location.replace()を使用してリダイレクト（React Routerの外で実行）
            window.location.replace(path);
            // リダイレクト中は何も表示しない
            return null;
          } else {
            // 24時間以上経過している場合は削除
            console.log('[PWA] Installation path expired, removing from localStorage');
            localStorage.removeItem('pwa-install-path');
          }
        }
      } catch (e) {
        // 古い形式（文字列のみ）の場合は、そのまま使用
        console.log('[PWA] App component - legacy format detected:', installPathData);
        const oldPath = installPathData;
        if (oldPath && oldPath !== '/') {
          console.log('[PWA] Redirecting to installation path (legacy format):', oldPath);
          window.location.replace(oldPath);
          // リダイレクト中は何も表示しない
          return null;
        }
      }
    } else {
      console.log('[PWA] No installation path data found in localStorage');
    }
  } else {
    console.log('[PWA] Not redirecting - isStandalone:', isStandalone, 'isPWALaunch:', isPWALaunch, 'currentPath:', currentPath);
  }
  
  useEffect(() => {
    const envValid = checkEnvironmentVariables();
    setEnvCheckPassed(envValid);
  }, []);

  // iOS向け: 通常のブラウザモードでページが読み込まれた時、URLパスを保存（タイムスタンプ付き）
  // （iOSではbeforeinstallprompt/appinstalledイベントが発火しないため）
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
    
    // iOSかつ通常のブラウザモードの場合、URLパスをタイムスタンプ付きで保存
    if (isIOS && !isStandalone) {
      const currentPath = window.location.pathname;
      const pathData = {
        path: currentPath,
        timestamp: Date.now()
      };
      localStorage.setItem('pwa-install-path', JSON.stringify(pathData));
      console.log('[PWA] iOS: Current path saved with timestamp:', currentPath);
    }
  }, []);

  if (!envCheckPassed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">環境設定エラー</h1>
            <p className="text-gray-600 mb-4">
              必要な環境変数が設定されていません。
            </p>
            <div className="text-left bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 mb-2">設定が必要な環境変数:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                <li>VITE_GOOGLE_MAPS_API_KEY</li>
                <li>VITE_API_BASE_URL</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              再読み込み
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
            <Routes>
            {/* 利用者用アプリ（ルート表示） */}
            <Route path="/user" element={
              <AuthProvider>
                <UserApp />
              </AuthProvider>
            } />
            
            {/* 利用者用プロフィール（認証必須） */}
            <Route path="/user/profile" element={
              <AuthProvider>
                <ProtectedRoute>
                  <Layout userLocation={null}>
                    <UserProfile />
                  </Layout>
                </ProtectedRoute>
              </AuthProvider>
            } />
            
            {/* 利用者用アプリ：マイ予約 */}
            <Route path="/user/reservations" element={
              <AuthProvider>
                <ProtectedRoute>
                  <Layout userLocation={null}>
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">読み込み中...</p></div></div>}>
                      <MyReservations />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              </AuthProvider>
            } />
            
            {/* Service Worker デバッグ画面（開発・デバッグ用） */}
            <Route path="/user/debug/sw" element={
              <AuthProvider>
                <Layout userLocation={null}>
                  <ServiceWorkerDebug />
                </Layout>
              </AuthProvider>
            } />
            
            {/* 店舗管理者用アプリ（Code Splitting） */}
            <Route path="/shop-manager/*" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">読み込み中...</p></div></div>}>
                <ShopManagerApp />
              </Suspense>
            } />
            
            {/* システム管理者用アプリ（Code Splitting） */}
            <Route path="/system-admin/*" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">読み込み中...</p></div></div>}>
                <SystemAdminApp />
              </Suspense>
            } />
            
            {/* スタッフ用アプリ（Code Splitting） */}
            <Route path="/staff/availability" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">読み込み中...</p></div></div>}>
                <StaffAvailabilityUpdate />
              </Suspense>
            } />
            
            {/* デフォルトは利用者用アプリ（PWA起動時は保存されたパスにリダイレクト） */}
            <Route path="/" element={<PWARootRedirect />} />
            </Routes>
            <Toaster />
            <OfflineIndicator />
            <AppBadgeManager />
          </Router>
        </ErrorBoundary>
      </QueryClientProvider>
  );
}

export default App;