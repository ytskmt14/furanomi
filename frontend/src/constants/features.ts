/**
 * 店舗フィーチャー（機能）の定義
 */

/**
 * フィーチャーのID定義
 */
export const SHOP_FEATURES = {
  RESERVATION: 'reservation',
  // Future features can be added here
} as const;

export type FeatureKey = typeof SHOP_FEATURES[keyof typeof SHOP_FEATURES];

/**
 * フィーチャーの情報
 */
export interface FeatureInfo {
  id: FeatureKey;
  name: string;
  label: string;
  description: string;
  icon: string;
}

/**
 * 利用可能なフィーチャー一覧
 */
export const AVAILABLE_FEATURES: Record<FeatureKey, FeatureInfo> = {
  [SHOP_FEATURES.RESERVATION]: {
    id: 'reservation',
    name: 'reservation',
    label: '予約機能',
    description: '利用者が店舗を予約できる機能',
    icon: '📅',
  },
} as const;

/**
 * フィーチャー情報を取得
 */
export const getFeatureInfo = (featureKey: FeatureKey): FeatureInfo | undefined => {
  return AVAILABLE_FEATURES[featureKey];
};

/**
 * フィーチャーラベルを取得
 */
export const getFeatureLabel = (featureKey: FeatureKey): string => {
  return AVAILABLE_FEATURES[featureKey]?.label || featureKey;
};

/**
 * フィーチャーが有効かチェック
 */
export const isFeatureEnabled = (
  features: Record<string, boolean> | undefined,
  featureKey: FeatureKey
): boolean => {
  return features?.[featureKey] ?? false;
};
