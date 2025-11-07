/**
 * 可用性ステータスと表示情報の定義
 */

import { AvailabilityStatus } from '../types/shop';

/**
 * 可用性ステータスの定義
 */
export const AVAILABILITY_STATUSES = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  FULL: 'full',
  CLOSED: 'closed',
} as const;

/**
 * 可用性ステータスの表示情報
 */
export interface AvailabilityOption {
  value: AvailabilityStatus;
  label: string;
  icon: string;
  color: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

/**
 * 各ステータスの表示情報マッピング
 */
export const AVAILABILITY_OPTIONS: Record<AvailabilityStatus, AvailabilityOption> = {
  available: {
    value: 'available',
    label: '空きあり',
    icon: '🟢',
    color: 'bg-green-100',
    badgeColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    description: '席に余裕があります',
  },
  busy: {
    value: 'busy',
    label: '混雑',
    icon: '🟡',
    color: 'bg-yellow-100',
    badgeColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    description: '混雑していますが入店可能です',
  },
  full: {
    value: 'full',
    label: '満席',
    icon: '🔴',
    color: 'bg-red-100',
    badgeColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    description: '満席です',
  },
  closed: {
    value: 'closed',
    label: '営業時間外',
    icon: '⚫',
    color: 'bg-gray-100',
    badgeColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    description: '営業時間外です',
  },
} as const;

/**
 * ステータスの表示テキストを取得
 */
export const getAvailabilityLabel = (status: AvailabilityStatus): string => {
  return AVAILABILITY_OPTIONS[status]?.label || status;
};

/**
 * ステータスのアイコンを取得
 */
export const getAvailabilityIcon = (status: AvailabilityStatus): string => {
  return AVAILABILITY_OPTIONS[status]?.icon || '❓';
};

/**
 * ステータスの背景色を取得
 */
export const getAvailabilityColor = (status: AvailabilityStatus): string => {
  return AVAILABILITY_OPTIONS[status]?.color || 'bg-gray-100';
};

/**
 * ステータスの説明を取得
 */
export const getAvailabilityDescription = (status: AvailabilityStatus): string => {
  return AVAILABILITY_OPTIONS[status]?.description || '';
};
