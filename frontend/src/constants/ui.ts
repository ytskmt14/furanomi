/**
 * UI関連の定数定義
 */

/**
 * 画像処理の制約
 */
export const IMAGE_CONSTRAINTS = {
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  COMPRESSION_QUALITY: 0.8,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
} as const;

/**
 * キャッシュのTTL設定（ミリ秒）
 */
export const CACHE_TTL = {
  SHOP_FEATURES: 5 * 60 * 1000,      // 5分
  USER_LOCATION: 5 * 60 * 1000,      // 5分
  SHOP_LIST: 2 * 60 * 1000,          // 2分
  FAVORITES: 10 * 60 * 1000,         // 10分
  USER_PROFILE: 15 * 60 * 1000,      // 15分
} as const;

/**
 * APIのタイムアウト設定（ミリ秒）
 */
export const API_TIMEOUT = {
  DEFAULT: 10000,     // 10秒
  SHORT: 5000,        // 5秒
  LONG: 30000,        // 30秒
  GEOLOCATION: 10000, // 10秒
} as const;

/**
 * ジオロケーションの設定
 */
export const GEOLOCATION_OPTIONS = {
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT: 10000,          // 10秒
  MAXIMUM_AGE: 5 * 60 * 1000, // 5分
} as const;

/**
 * スペーシング定数
 */
export const SPACING = {
  XS: '0.25rem',
  SM: '0.5rem',
  MD: '1rem',
  LG: '1.5rem',
  XL: '2rem',
  '2XL': '2.5rem',
} as const;

/**
 * ボタンサイズ
 */
export const BUTTON_SIZES = {
  SM: 'px-2 py-1 text-sm',
  MD: 'px-4 py-2',
  LG: 'px-6 py-3 text-lg',
} as const;

/**
 * フォーム入力の制限
 */
export const FORM_CONSTRAINTS = {
  SHOP_NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  ADDRESS_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 255,
  PASSCODE_LENGTH: 4,
} as const;

/**
 * アニメーション設定
 */
export const ANIMATION = {
  DURATION_FAST: 150,    // ms
  DURATION_BASE: 300,    // ms
  DURATION_SLOW: 500,    // ms
  EASING_DEFAULT: 'ease-in-out',
} as const;

/**
 * Zインデックス
 */
export const Z_INDEX = {
  DROPDOWN: 10,
  MODAL: 100,
  TOAST: 1000,
  TOOLTIP: 1050,
} as const;

/**
 * ブレークポイント（Tailwind互換）
 */
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

/**
 * 検索とソートのデフォルト
 */
export const SEARCH_DEFAULTS = {
  DEFAULT_RADIUS_KM: 10,
  DEFAULT_SORT: 'distance' as const,
  MIN_RATING: 0,
  MAX_RATING: 5,
  RESULTS_PER_PAGE: 20,
} as const;
