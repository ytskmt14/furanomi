import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiService, User } from '../../services/api';
import { LayoutDashboard, Store, CalendarDays, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react';
import { PWAInstallPrompt } from '../PWAInstallPrompt';

interface ShopManagerLayoutProps {
  children: React.ReactNode;
}

export const ShopManagerLayout: React.FC<ShopManagerLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiService.getCurrentUser();
        setUser(response.user);

        // 店舗情報がある場合、予約機能が有効かチェック
        if (response.user?.shop?.id) {
          try {
            const featuresResponse = await apiService.getShopFeatures(response.user.shop.id);
            setReservationEnabled(featuresResponse.features.reservation === true);
          } catch (error) {
            console.error('Failed to check reservation feature:', error);
            setReservationEnabled(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // 認証エラーの場合はログイン画面に遷移
        navigate('/shop-manager/login');
      }
    };

    fetchUser();
  }, [navigate]);

  // SEO設定: 管理画面はnoindex
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    const metaGooglebot = document.createElement('meta');
    metaGooglebot.name = 'googlebot';
    metaGooglebot.content = 'noindex, nofollow';
    document.head.appendChild(metaGooglebot);

    document.title = '店舗管理 - ふらのみ';

    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaGooglebot);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await apiService.logout();
      navigate('/shop-manager/login');
    } catch (error) {
      console.error('Logout error:', error);
      // エラーが発生してもログイン画面に遷移
      navigate('/shop-manager/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ・タイトル */}
            <div className="flex items-center flex-1">
              <Link to="/shop-manager/" className="flex items-center space-x-2 sm:space-x-3">
                <img src="/logo.svg" alt="ふらのみ" className="w-7 h-7 sm:w-8 sm:h-8" />
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">店舗管理</h1>
              </Link>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              <Link
                to="/shop-manager/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/shop-manager/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" /> ダッシュボード
                </span>
              </Link>
              <Link
                to="/shop-manager/shop"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/shop-manager/shop')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <Store className="w-4 h-4" /> 店舗情報
                </span>
              </Link>
              {reservationEnabled && (
                <Link
                  to="/shop-manager/reservations"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/shop-manager/reservations')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" /> 予約管理
                  </span>
                </Link>
              )}
              <Link
                to="/shop-manager/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/shop-manager/settings')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <SettingsIcon className="w-4 h-4" /> 設定
                </span>
              </Link>
            </nav>

            {/* デスクトップ: ユーザー情報・ログアウト */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {user && user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user 
                      ? 'ユーザー' 
                      : '読み込み中...'}
                </span>
                <span className="text-gray-400 ml-2">さん</span>
              </div>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                </span>
              </button>
            </div>

            {/* モバイル: メニューボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="メニュー"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* モバイルメニュー */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/shop-manager/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/shop-manager/')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> ダッシュボード
                  </span>
                </Link>
                <Link
                  to="/shop-manager/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/shop-manager/shop')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Store className="w-4 h-4" /> 店舗情報
                  </span>
                </Link>
                {reservationEnabled && (
                  <Link
                    to="/shop-manager/reservations"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/shop-manager/reservations')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" /> 予約管理
                    </span>
                  </Link>
                )}
                <Link
                  to="/shop-manager/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/shop-manager/settings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" /> 設定
                  </span>
                </Link>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-4 py-2 text-sm text-gray-600">
                    <span className="font-medium">
                      {user && user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user 
                          ? 'ユーザー' 
                          : '読み込み中...'}
                    </span>
                    <span className="text-gray-400 ml-2">さん</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                    </span>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-6">
        {children}
      </main>

      {/* モバイル用ボトムナビゲーション */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom">
        <div className="flex justify-around py-2">
          <Link
            to="/shop-manager/"
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium min-w-0 flex-1 ${
              isActive('/shop-manager/')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-1" />
            <span className="truncate">ダッシュボード</span>
          </Link>
          <Link
            to="/shop-manager/shop"
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium min-w-0 flex-1 ${
              isActive('/shop-manager/shop')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Store className="w-5 h-5 mb-1" />
            <span className="truncate">店舗情報</span>
          </Link>
          {reservationEnabled && (
            <Link
              to="/shop-manager/reservations"
              className={`flex flex-col items-center py-2 px-3 text-xs font-medium min-w-0 flex-1 ${
                isActive('/shop-manager/reservations')
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <CalendarDays className="w-5 h-5 mb-1" />
              <span className="truncate">予約管理</span>
            </Link>
          )}
          <Link
            to="/shop-manager/settings"
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium min-w-0 flex-1 ${
              isActive('/shop-manager/settings')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <SettingsIcon className="w-5 h-5 mb-1" />
            <span className="truncate">設定</span>
          </Link>
        </div>
      </div>

      {/* PWAインストールプロンプト */}
      <PWAInstallPrompt />
    </div>
  );
};
