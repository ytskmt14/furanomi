// 空き状況の表示用ヘルパー
export const getAvailabilityText = (status: string): string => {
  switch (status) {
    case 'available':
      return '空きあり';
    case 'busy':
      return '混雑';
    case 'full':
      return '満席';
    case 'closed':
      return '営業時間外';
    default:
      return '不明';
  }
};

export const getAvailabilityColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'busy':
      return 'bg-yellow-100 text-yellow-800';
    case 'full':
      return 'bg-red-100 text-red-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getAvailabilityColorValue = (status: string): string => {
  switch (status) {
    case 'available':
      return '#10b981'; // green-500
    case 'busy':
      return '#f59e0b'; // amber-500
    case 'full':
      return '#ef4444'; // red-500
    case 'closed':
      return '#6b7280'; // gray-500
    default:
      return '#6b7280';
  }
};

// カテゴリの表示用ヘルパー
export const getCategoryText = (category: string): string => {
  switch (category) {
    case 'restaurant':
      return 'レストラン';
    case 'cafe':
      return 'カフェ';
    case 'izakaya':
      return '居酒屋';
    default:
      return 'その他';
  }
};

export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'restaurant':
      return '🍽️';
    case 'cafe':
      return '☕';
    case 'izakaya':
      return '🍶';
    default:
      return '🏪';
  }
};
