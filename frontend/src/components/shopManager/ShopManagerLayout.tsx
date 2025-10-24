import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiService, User } from '../../services/api';

interface ShopManagerLayoutProps {
  children: React.ReactNode;
}

export const ShopManagerLayout: React.FC<ShopManagerLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiService.getCurrentUser();
        setUser(response.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // 認証エラーの場合はログイン画面に遷移
        navigate('/shop-manager/login');
      }
    };

    fetchUser();
  }, [navigate]);

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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ・タイトル */}
            <div className="flex items-center">
              <Link to="/shop-manager/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">店</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">店舗管理</h1>
              </Link>
            </div>

            {/* ナビゲーション */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/shop-manager/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/shop-manager/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📊 ダッシュボード
              </Link>
              <Link
                to="/shop-manager/shop"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/shop-manager/shop')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                🏪 店舗情報
              </Link>
              <Link
                to="/shop-manager/availability"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/shop-manager/availability')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📈 空き状況
              </Link>
            </nav>

            {/* ユーザー情報・ログアウト */}
            <div className="flex items-center space-x-4">
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
                {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* モバイル用ナビゲーション */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link
            to="/shop-manager/"
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium ${
              isActive('/shop-manager/')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">📊</span>
            <span>ダッシュボード</span>
          </Link>
          <Link
            to="/shop-manager/shop"
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium ${
              isActive('/shop-manager/shop')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">🏪</span>
            <span>店舗情報</span>
          </Link>
          <Link
            to="/shop-manager/availability"
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium ${
              isActive('/shop-manager/availability')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">📈</span>
            <span>空き状況</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
