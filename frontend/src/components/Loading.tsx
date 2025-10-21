import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = '読み込み中...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* スピナー */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* 外側のリング */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}></div>
        {/* 回転するリング */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-blue-600 animate-spin absolute top-0 left-0`}></div>
      </div>
      
      {/* ローディングテキスト */}
      {text && (
        <div className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinner}
    </div>
  );
};

// カード用のローディングスケルトン
export const LoadingCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/50 overflow-hidden animate-pulse">
      {/* 画像部分 */}
      <div className="h-64 bg-gray-200"></div>
      
      {/* コンテンツ部分 */}
      <div className="p-6 space-y-4">
        {/* 店舗名 */}
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        
        {/* 住所 */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* 営業時間と距離 */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>
    </div>
  );
};

// リスト用のローディングスケルトン
export const LoadingList: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  );
};

// インラインローディング（ボタン内など）
export const InlineLoading: React.FC<{ text?: string }> = ({ text = '処理中...' }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};
