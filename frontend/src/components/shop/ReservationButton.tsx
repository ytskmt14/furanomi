/**
 * 予約ボタンコンポーネント
 * 店舗の予約機能が有効な場合に表示される CTA ボタン
 */

import React from 'react';
import { Clock, CalendarDays } from 'lucide-react';
import { AvailabilityStatus } from '../../types/shop';

interface ReservationButtonProps {
  /** 予約機能が有効か */
  enabled: boolean;
  /** 店舗の空き状況 */
  availabilityStatus: AvailabilityStatus;
  /** クリック時のコールバック */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * 予約ボタン
 *
 * @example
 * ```tsx
 * <ReservationButton
 *   enabled={true}
 *   availabilityStatus="available"
 *   onClick={() => openReservationModal()}
 * />
 * ```
 */
export const ReservationButton: React.FC<ReservationButtonProps> = ({
  enabled,
  availabilityStatus,
  onClick,
}) => {
  const isClosed = availabilityStatus === 'closed';

  if (!enabled) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={isClosed}
      className={`w-full min-h-[44px] sm:min-h-[48px] py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 touch-manipulation ${
        isClosed
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg active:shadow-sm active:scale-[0.98]'
      }`}
      aria-label={isClosed ? '営業時間外' : '予約する'}
    >
      {isClosed ? (
        <>
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
          <span className="whitespace-nowrap">営業時間外</span>
        </>
      ) : (
        <>
          <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
          <span className="whitespace-nowrap">予約する</span>
        </>
      )}
    </button>
  );
};
