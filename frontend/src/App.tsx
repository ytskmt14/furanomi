import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ShopList } from './components/ShopList';
import { MapView } from './components/MapView';
import { ShopDetail } from './components/ShopDetail';
import { SearchModal } from './components/SearchModal';
import { FloatingSearchButton } from './components/FloatingSearchButton';
import { LoadingList } from './components/Loading';
import { ErrorBoundary, ErrorMessage, NoSearchResults } from './components/ErrorHandling';
import { ShopManagerApp } from './components/shopManager/ShopManagerApp';
import { SystemAdminApp } from './components/systemAdmin/SystemAdminApp';
import { StaffAvailabilityUpdate } from './components/staff/StaffAvailabilityUpdate';
import { apiService } from './services/api';
import { Shop } from './types/shop';
import { Button } from './components/ui/button';

// 利用者用アプリ
const UserApp: React.FC = () => {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleShopSelect = (shop: Shop) => {
    console.log('Shop selected:', shop);
    setSelectedShop(shop);
  };

  const handleCloseDetail = () => {
    setSelectedShop(null);
  };

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const handleFilteredShops = (shops: Shop[]) => {
    setFilteredShops(shops);
  };

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    await loadShops();
  };

  const handleClearFilters = () => {
    setFilteredShops(shops);
  };

  // 位置情報を取得
  const getUserLocation = (): Promise<{lat: number, lng: number}> => {
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
  };

  // 店舗データを読み込み
  const loadShops = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 位置情報を取得してから店舗を検索
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        
        // 位置情報ベースで店舗を検索
        const response = await apiService.searchShopsByLocation(location.lat, location.lng);
        setShops(response.shops);
        setFilteredShops(response.shops);
      } catch (locationError) {
        console.warn('位置情報の取得に失敗、全店舗を表示:', locationError);
        
        // 位置情報が取得できない場合は全店舗を表示
        const response = await apiService.getShops();
        setShops(response.shops);
        setFilteredShops(response.shops);
      }
    } catch (err) {
      console.error('店舗データの読み込みに失敗:', err);
      setError(err instanceof Error ? err.message : '店舗データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    loadShops();
  }, []);

  return (
    <Layout userLocation={userLocation}>
      <div className="w-full">
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'
            }`}
          >
            📋 リスト表示
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              viewMode === 'map' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'
            }`}
          >
            🗺️ 地図表示
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
              <ShopList shops={filteredShops} onShopSelect={handleShopSelect} />
            ) : (
              <MapView 
                shops={filteredShops} 
                userLocation={userLocation}
                onShopSelect={handleShopSelect} 
              />
            )}
          </>
        )}

        {selectedShop && (
          <ShopDetail shop={selectedShop} onClose={handleCloseDetail} />
        )}

        <SearchModal
          isOpen={isSearchOpen}
          onClose={handleSearchClose}
          shops={shops}
          onFilteredShops={handleFilteredShops}
        />

        <FloatingSearchButton onClick={handleSearchOpen} />
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
    return !value || value.includes('YOUR_') || value.includes('localhost');
  });
  
  if (missingVars.length > 0) {
    console.error('Missing or invalid environment variables:', missingVars);
    return false;
  }
  
  return true;
};

function App() {
  const [envCheckPassed, setEnvCheckPassed] = useState(true);
  
  useEffect(() => {
    const envValid = checkEnvironmentVariables();
    setEnvCheckPassed(envValid);
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
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* 利用者用アプリ（ルート表示） */}
          <Route path="/user/*" element={<UserApp />} />
          
          {/* 店舗管理者用アプリ */}
          <Route path="/shop-manager/*" element={<ShopManagerApp />} />
          
          {/* システム管理者用アプリ */}
          <Route path="/system-admin/*" element={<SystemAdminApp />} />
          
          {/* スタッフ用アプリ */}
          <Route path="/staff/availability" element={<StaffAvailabilityUpdate />} />
          
          {/* デフォルトは利用者用アプリ */}
          <Route path="/" element={<Navigate to="/user" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;