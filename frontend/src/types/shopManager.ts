// 店舗管理者用の型定義
import { Shop, BusinessHours, ShopManager } from './shop';

/**
 * 店舗管理者の詳細情報
 */
export interface ShopManagerDetail extends ShopManager {
  email: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * スタッフアクセス情報
 */
export interface StaffAccess {
  token: string;
  passcode: string;
  tokenCreatedAt: string;
  qrCodeUrl: string;
}

/**
 * 店舗管理者から見た店舗情報（拡張版）
 */
export interface ShopManagerShop extends Shop {
  shop_manager_id?: string;
  availability?: ShopAvailability;
  images?: ShopImage[];
  staff_access?: StaffAccess;
}

/**
 * 店舗の空き状況
 */
export interface ShopAvailability {
  id: string;
  shop_id: string;
  status: 'available' | 'busy' | 'full' | 'closed';
  updated_at: string;
}

/**
 * 店舗画像
 */
export interface ShopImage {
  id: string;
  shop_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

// フォーム用の型定義
export interface ShopFormData {
  name: string;
  description: string | null;
  address: string;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  category: 'restaurant' | 'cafe' | 'izakaya';
  business_hours: BusinessHours;
  image_url: string | null;
  is_active?: boolean;
}

export interface AvailabilityFormData {
  status: 'available' | 'busy' | 'full' | 'closed';
}

// ログイン用の型定義
export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  manager: ShopManager;
  shop?: ShopManagerShop;
}
