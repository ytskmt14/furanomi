/**
 * 距離表示コンポーネント
 * 店舗までの距離をフォーマットして表示
 */

import React, { useMemo } from 'react';
import { Navigation } from 'lucide-react';

interface DistanceDisplayProps {
  /** 距離（メートル単位） */
  distance?: number;
}

/**
 * 距離を表示するコンポーネント
 *
 * @example
 * ```tsx
 * <DistanceDisplay distance={1500} />  // 1.5km
 * <DistanceDisplay distance={350} />   // 350m
 * ```
 */
export const DistanceDisplay: React.FC<DistanceDisplayProps> = ({ distance }) => {
  const formattedDistance = useMemo(() => {
    if (!distance) return null;
    if (distance < 1000) {
      return `${distance}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }, [distance]);

  if (!formattedDistance) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-white/30">
      <span className="text-sm font-medium text-gray-700 inline-flex items-center gap-1">
        <Navigation className="w-4 h-4" /> {formattedDistance}
      </span>
    </div>
  );
};
