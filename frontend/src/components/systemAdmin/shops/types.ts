/**
 * 店舗登録フロー用の型定義
 */

import { ShopCategory, BusinessHours } from '@/types/shop';

/**
 * 店舗登録フォームデータ
 */
export interface ShopOnboardingFormData {
  // Step 1: 基本情報
  name: string;
  description: string;
  category: ShopCategory;
  
  // Step 2: 住所・位置情報
  postalCode: string;
  address: string;
  formattedAddress: string;
  placeId: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  
  // Step 3: 店舗管理者
  shop_manager_id: string;
  newManagerData?: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  managerMode: 'existing' | 'new';
  
  // Step 4: 営業時間
  business_hours: BusinessHours;
  
  // Step 5: 画像
  image_url: string;
}

/**
 * フォームエラー状態
 */
export interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * ステップの状態
 */
export type StepStatus = 'pending' | 'completed' | 'current';

/**
 * デフォルトの営業時間
 */
export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { open: '09:00', close: '21:00', close_next_day: false, is_closed: false },
  tuesday: { open: '09:00', close: '21:00', close_next_day: false, is_closed: false },
  wednesday: { open: '09:00', close: '21:00', close_next_day: false, is_closed: false },
  thursday: { open: '09:00', close: '21:00', close_next_day: false, is_closed: false },
  friday: { open: '09:00', close: '21:00', close_next_day: false, is_closed: false },
  saturday: { open: '09:00', close: '21:00', close_next_day: false, is_closed: false },
  sunday: { open: '09:00', close: '21:00', close_next_day: false, is_closed: false },
};

/**
 * 初期フォームデータ
 */
export const INITIAL_FORM_DATA: ShopOnboardingFormData = {
  name: '',
  description: '',
  category: 'restaurant',
  postalCode: '',
  address: '',
  formattedAddress: '',
  placeId: '',
  latitude: 0,
  longitude: 0,
  phone: '',
  email: '',
  shop_manager_id: '',
  managerMode: 'existing',
  business_hours: DEFAULT_BUSINESS_HOURS,
  image_url: '',
};

