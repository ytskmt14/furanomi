import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  userLocation?: {lat: number, lng: number} | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, userLocation }) => {
  const [locationText, setLocationText] = useState('現在地: 取得中...');
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 現在地の表示テキストを生成
  useEffect(() => {
    const updateLocationText = async () => {
      if (!userLocation) {
        setLocationText('現在地: 取得中...');
        return;
      }
      
      try {
        const address = await apiService.reverseGeocode(userLocation.lat, userLocation.lng);
        setLocationText(`現在地: ${address}`);
      } catch (error) {
        console.error('Failed to get location text:', error);
        setLocationText(`現在地: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
      }
    };

    updateLocationText();
  }, [userLocation]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Apple風ヘッダー */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm">
        {/* メインヘッダー */}
             <div className="max-w-8xl mx-auto px-4 py-6">
               <div className="flex items-center justify-center">
                 <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                   ふらのみ
                 </h1>
               </div>
             </div>

        {/* セクション分け */}
        <div className="border-t border-gray-100">
          <div className="max-w-8xl mx-auto px-4 py-3">
            <p className="text-sm text-gray-600 font-medium">
              近くのお店の空き状況をチェック
            </p>
          </div>
        </div>

        {/* 情報セクション */}
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-8xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{locationText}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 py-8 px-4 w-full max-w-8xl mx-auto">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200/60 text-gray-600 text-center py-6">
        <p className="text-sm font-medium">&copy; 2024 ふらのみ. All rights reserved.</p>
      </footer>
    </div>
  );
};