/**
 * API レスポンス型定義
 */

import { Shop } from './shop';
import { User } from '../services/api';

/**
 * 汎用 API レスポンス
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * ページネーション付き汎用レスポンス
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

// ============================================
// 認証関連
// ============================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

// ============================================
// 店舗関連
// ============================================

export interface GetShopsResponse extends PaginatedResponse<Shop> {}

export interface GetShopResponse {
  shop: Shop;
}

export interface CreateShopRequest {
  name: string;
  description?: string;
  address: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  category: 'restaurant' | 'cafe' | 'izakaya';
  latitude: number;
  longitude: number;
  business_hours: {
    [key: string]: { open: string; close: string; close_next_day?: boolean };
  };
  image_url?: string;
}

export interface CreateShopResponse {
  shop: Shop;
  message: string;
}

export interface UpdateShopRequest {
  name?: string;
  description?: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  category?: 'restaurant' | 'cafe' | 'izakaya';
  latitude?: number;
  longitude?: number;
  business_hours?: {
    [key: string]: { open: string; close: string; close_next_day?: boolean };
  };
  image_url?: string;
  is_active?: boolean;
}

export interface UpdateShopResponse {
  shop: Shop;
  message: string;
}

export interface DeleteShopResponse {
  message: string;
}

// ============================================
// 空き状況関連
// ============================================

export interface ShopAvailability {
  shop_id: string;
  status: 'available' | 'busy' | 'full' | 'closed';
  updated_at: string;
}

export interface UpdateAvailabilityRequest {
  status: 'available' | 'busy' | 'full' | 'closed';
}

export interface UpdateAvailabilityResponse {
  status: ShopAvailability;
  message: string;
}

export interface GetAvailabilityResponse {
  availability: ShopAvailability;
}

// ============================================
// スタッフ関連
// ============================================

export interface GetShopByStaffTokenResponse {
  id: string;
  name: string;
  availability_status: string;
  [key: string]: unknown;
}

export interface AuthenticateStaffRequest {
  passcode: string;
}

export interface AuthenticateStaffResponse {
  success: boolean;
  shop: {
    id: string;
    name: string;
  };
  message?: string;
}

export interface UpdateAvailabilityByStaffRequest {
  passcode: string;
  status: 'available' | 'busy' | 'full' | 'closed';
}

export interface UpdateAvailabilityByStaffResponse {
  success: boolean;
  status: string;
  updated_at: string;
  message?: string;
}

// ============================================
// スタッフアクセス関連
// ============================================

export interface GetStaffAccessInfoResponse {
  staff_access_token: string;
  staff_passcode: string;
  staff_token_created_at: string;
}

export interface UpdateStaffAccessInfoRequest {
  regenerateToken?: boolean;
  regeneratePasscode?: boolean;
}

export interface UpdateStaffAccessInfoResponse {
  staff_access_token: string;
  staff_passcode: string;
  staff_token_created_at: string;
  message?: string;
}

// ============================================
// フィーチャー関連
// ============================================

export interface ShopFeaturesResponse {
  features: Record<string, boolean>;
}

export interface UpdateShopFeaturesRequest {
  [featureKey: string]: boolean;
}

export interface UpdateShopFeaturesResponse {
  features: Record<string, boolean>;
  message?: string;
}

// ============================================
// お気に入り関連
// ============================================

export interface GetFavoritesResponse {
  favorites: string[]; // shop IDs
  message?: string;
}

export interface AddFavoriteRequest {
  shop_id: string;
}

export interface AddFavoriteResponse {
  message: string;
  shop_id: string;
}

export interface RemoveFavoriteResponse {
  message: string;
  shop_id: string;
}

// ============================================
// 予約関連（将来実装向け）
// ============================================

export interface CreateReservationRequest {
  shop_id: string;
  reserved_at: string;
  party_size: number;
  notes?: string;
}

export interface CreateReservationResponse {
  reservation_id: string;
  message: string;
}

export interface GetReservationsResponse extends PaginatedResponse<{
  id: string;
  shop_id: string;
  reserved_at: string;
  party_size: number;
  notes?: string;
  created_at: string;
}> {}

// ============================================
// ユーザー関連
// ============================================

export interface GetUserResponse {
  user: User;
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UpdateUserResponse {
  user: User;
  message: string;
}

// ============================================
// ダッシュボード関連
// ============================================

export interface DashboardStats {
  total_shops: number;
  active_shops: number;
  total_managers: number;
  total_users: number;
  shops_by_category: Record<string, number>;
  [key: string]: unknown;
}

export interface GetDashboardStatsResponse {
  stats: DashboardStats;
}
