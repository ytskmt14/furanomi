import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiService, User } from '../../services/api';

interface SystemAdminLayoutProps {
  children: React.ReactNode;
}

export const SystemAdminLayout: React.FC<SystemAdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [_isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // ユーザー情報を取得（初回のみ）
  useEffect(() => {
    const fetchUser = async () => {
      // 既に認証チェック済みの場合は再チェックしない
      if (hasCheckedAuth) return;
      
      try {
        const response = await apiService.getCurrentUser();
        setUser(response.user);
        
        // システム管理者でない場合はログイン画面に遷移
        if (response.user.role !== 'system_admin') {
          navigate('/system-admin/login');
          return;
        }
        
        setIsAuthenticated(true);
        setHasCheckedAuth(true);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // 認証エラーの場合はログイン画面に遷移
        navigate('/system-admin/login');
      }
    };

    fetchUser();
  }, []); // 依存配列を空にして初回のみ実行

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

    document.title = 'システム管理 - ふらのみ';

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
      setIsAuthenticated(false);
      setUser(null);
      setHasCheckedAuth(false);
      navigate('/system-admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // エラーが発生してもログイン画面に遷移
      setIsAuthenticated(false);
      setUser(null);
      setHasCheckedAuth(false);
      navigate('/system-admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー - モバイルファースト */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="ふらのみ" className="w-6 h-6" />
              <h1 className="text-lg font-semibold text-gray-900">システム管理</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-gray-600">
                <span className="font-medium">
                  {user && user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user 
                      ? '管理者' 
                      : '読み込み中...'}
                </span>
                <span className="text-gray-400 ml-1">さん</span>
              </div>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-600 hover:text-gray-900 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1"
              >
                {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ - モバイルファースト */}
      <main className="pb-20">
        {children}
      </main>

      {/* モバイル用ナビゲーション - モバイルファースト */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          <Link
            to="/system-admin/"
            className={`flex flex-col items-center py-2 px-2 text-xs font-medium ${
              isActive('/system-admin/')
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">📊</span>
            <span>ダッシュボード</span>
          </Link>
          <Link
            to="/system-admin/shops"
            className={`flex flex-col items-center py-2 px-2 text-xs font-medium ${
              isActive('/system-admin/shops')
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">🏪</span>
            <span>店舗管理</span>
          </Link>
          <Link
            to="/system-admin/managers"
            className={`flex flex-col items-center py-2 px-2 text-xs font-medium ${
              isActive('/system-admin/managers')
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">👥</span>
            <span>管理者管理</span>
          </Link>
          <Link
            to="/system-admin/settings"
            className={`flex flex-col items-center py-2 px-2 text-xs font-medium ${
              isActive('/system-admin/settings')
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">⚙️</span>
            <span>設定</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
