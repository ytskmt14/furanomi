import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LoginModal } from './auth/LoginModal';
import { RegisterModal } from './auth/RegisterModal';
import { CalendarDays, User as UserIcon, MapPin, Clock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userLocation?: {lat: number, lng: number} | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, userLocation: propUserLocation }) => {
  const [locationText, setLocationText] = useState('現在地: 取得中...');
  const [internalUserLocation, setInternalUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [pendingReservationsCount, setPendingReservationsCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 位置情報を取得（propUserLocationが渡されていない、またはnullの場合）
  useEffect(() => {
    // propUserLocationが有効な値（null以外）で渡されている場合はそれを使用
    if (propUserLocation !== undefined && propUserLocation !== null) {
      return;
    }

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

    getUserLocation()
      .then((location) => {
        console.log('Layout: 位置情報を取得しました:', location);
        setInternalUserLocation(location);
      })
      .catch((error) => {
        console.warn('Layout: 位置情報の取得に失敗:', error);
        setLocationText('現在地: 取得できませんでした');
      });
  }, [propUserLocation]);

  // 現在地の表示テキストを生成
  useEffect(() => {
    const updateLocationText = async () => {
      // propUserLocationが有効な値（null以外）ならそれを使用、なければinternalUserLocationを使用
      const location = (propUserLocation !== undefined && propUserLocation !== null) 
        ? propUserLocation 
        : internalUserLocation;
      
      if (!location) {
        // 位置情報がまだ取得中の場合
        if ((propUserLocation === undefined || propUserLocation === null) && internalUserLocation === null) {
          setLocationText('現在地: 取得中...');
        } else {
          setLocationText('現在地: 取得できませんでした');
        }
        return;
      }
      
      try {
        const address = await apiService.reverseGeocode(location.lat, location.lng);
        setLocationText(`現在地: ${address}`);
      } catch (error) {
        console.error('Failed to get location text:', error);
        setLocationText(`現在地: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
      }
    };

    updateLocationText();
  }, [propUserLocation, internalUserLocation]);

  // 予約件数を取得
  useEffect(() => {
    const fetchPendingReservationsCount = async () => {
      if (!isAuthenticated) {
        setPendingReservationsCount(0);
        return;
      }

      try {
        const response = await apiService.getMyReservations();
        const pendingCount = response.reservations.filter((r: any) => r.status === 'pending').length;
        setPendingReservationsCount(pendingCount);
      } catch (error) {
        console.error('Failed to fetch pending reservations count:', error);
        setPendingReservationsCount(0);
      }
    };

    fetchPendingReservationsCount();
  }, [isAuthenticated]);

  // ドロップダウンの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Apple風ヘッダー */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm sticky top-0 z-30">
        {/* メインヘッダー */}
        <div className="max-w-8xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            {/* ロゴとタイトル */}
            <Link to="/user" className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="ふらのみ" className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                ふらのみ
              </h1>
            </Link>

            {/* 認証ボタン */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated && user ? (
                <>
                  {/* 予約通知アイコン */}
                  <Link 
                    to="/user/reservations" 
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
                    {pendingReservationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingReservationsCount}
                      </span>
                    )}
                  </Link>

                  {/* ユーザーメニュー */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{user.name} さん</span>
                      <span className="sm:hidden">{user.name.length > 5 ? user.name.substring(0, 5) + '...' : user.name}</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <Link
                          to="/user/reservations"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <span className="inline-flex items-center gap-2"><CalendarDays className="w-4 h-4" />マイ予約</span>
                        </Link>
                        <Link
                          to="/user/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <span className="inline-flex items-center gap-2"><UserIcon className="w-4 h-4" />プロフィール</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        >
                          ログアウト
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    新規登録
                  </button>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    ログイン
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* セクション分け */}
        <div className="border-t border-gray-100">
          <div className="max-w-8xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              近くのお店の空き状況をチェック
            </p>
          </div>
        </div>

        {/* 情報セクション */}
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-8xl mx-auto px-3 sm:px-4 py-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs text-gray-500">
              <div className="flex items-center space-x-1 min-w-0 flex-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span className="whitespace-nowrap">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 py-4 sm:py-6 md:py-8 px-3 sm:px-4 w-full max-w-8xl mx-auto">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200/60 text-gray-600 text-center py-4 sm:py-6">
        <p className="text-xs sm:text-sm font-medium">&copy; 2025 ふらのみ. All rights reserved.</p>
      </footer>

      {/* 認証モーダル */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSwitchToRegister={() => setIsRegisterOpen(true)}
      />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
};