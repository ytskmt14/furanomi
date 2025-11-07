/**
 * 空き状況バッジコンポーネント
 * 店舗の営業状況を色分けされたバッジで表示
 */

import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { AvailabilityStatus } from '../../types/shop';
import { getAvailabilityText } from '../../utils/helpers';

interface AvailabilityBadgeProps {
  /** 空き状況 */
  status: AvailabilityStatus;
}

/**
 * 空き状況を表示するバッジ
 *
 * @example
 * ```tsx
 * <AvailabilityBadge status="available" />
 * ```
 */
export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({ status }) => {
  const getIcon = (availability: AvailabilityStatus) => {
    const commonClasses = 'w-4 h-4 mr-1 inline-block text-white';
    switch (availability) {
      case 'available':
        return <CheckCircle className={commonClasses} />;
      case 'busy':
        return <AlertTriangle className={commonClasses} />;
      case 'full':
        return <XCircle className={commonClasses} />;
      case 'closed':
        return <Clock className={commonClasses} />;
      default:
        return null;
    }
  };

  const getBgColor = (availability: AvailabilityStatus): string => {
    switch (availability) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-orange-500';
      case 'full':
        return 'bg-red-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Badge
      className={`text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg border-0 ${getBgColor(
        status
      )}`}
    >
      <span className="inline-flex items-center">
        {getIcon(status)} {getAvailabilityText(status)}
      </span>
    </Badge>
  );
};
