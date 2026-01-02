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
      aria-label="お気に入り"
      onClick={onClick}
      disabled={isLoading}
      className={`rounded-full p-1 sm:p-1.5 text-sm transition-colors flex items-center justify-center touch-manipulation ${
        isFavorite
          ? 'text-yellow-600'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      <Star
        strokeWidth={2}
        className="w-[18px] h-[18px] sm:w-5 sm:h-5 inline-block"
        {...(isFavorite
          ? { fill: 'currentColor' }
          : { fill: 'none' })}
      />
    </button>
  );
};
