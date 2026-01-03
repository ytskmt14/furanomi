/**
 * お気に入りボタンコンポーネント
 * 認証済みユーザー向けのお気に入り切り替えボタン
 */

import React from 'react';
import { Star } from 'lucide-react';

interface FavoriteButtonProps {
  /** お気に入り状態 */
  isFavorite: boolean;
  /** 処理中か */
  isLoading: boolean;
  /** クリック時のコールバック */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * お気に入りボタン
 *
 * @example
 * ```tsx
 * <FavoriteButton
 *   isFavorite={true}
 *   isLoading={false}
 *   onClick={(e) => toggleFavorite(e, shopId)}
 * />
 * ```
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  isLoading,
  onClick,
}) => {
  return (
    <button
      aria-label={isFavorite ? 'お気に入りを解除' : 'お気に入りに追加'}
      onClick={onClick}
      disabled={isLoading}
      className={`rounded-full p-2 sm:p-1.5 text-sm transition-colors flex items-center justify-center touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 ${
        isFavorite
          ? 'text-yellow-600 active:text-yellow-700'
          : 'text-gray-600 hover:text-gray-800 active:text-gray-900'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Star
        strokeWidth={2}
        className="w-5 h-5 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 inline-block"
        {...(isFavorite
          ? { fill: 'currentColor' }
          : { fill: 'none' })}
      />
    </button>
  );
};
