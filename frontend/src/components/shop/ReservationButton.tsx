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
      className={`w-full mt-3 py-2.5 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors ${
        isClosed
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {isClosed ? (
        <>
          <Clock className="w-4 h-4" /> 営業時間外
        </>
      ) : (
        <>
          <CalendarDays className="w-4 h-4" /> 予約する
        </>
      )}
    </button>
  );
};
