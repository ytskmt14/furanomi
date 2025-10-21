// データベース型定義

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SystemAdmin {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  last_name: string;
  first_name: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ShopManager {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  last_name: string;
  first_name: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  category: 'restaurant' | 'cafe' | 'izakaya';
  latitude: number;
  longitude: number;
  business_hours: BusinessHours;
  image_url?: string;
  is_active: boolean;
  shop_manager_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ShopAvailability {
  id: string;
  shop_id: string;
  status: 'available' | 'busy' | 'full' | 'closed';
  updated_at: Date;
}

export interface ShopImage {
  id: string;
  shop_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: Date;
}

// API用の型定義（パスワードハッシュを除外）
export interface SystemAdminResponse {
  id: string;
  username: string;
  email: string;
  last_name: string;
  first_name: string;
  full_name: string; // 計算フィールド
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ShopManagerResponse {
  id: string;
  username: string;
  email: string;
  last_name: string;
  first_name: string;
  full_name: string; // 計算フィールド
  phone?: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ShopResponse extends Omit<Shop, 'created_by'> {
  availability?: ShopAvailability;
  images?: ShopImage[];
}

// 検索用の型定義
export interface ShopSearchParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  category?: 'restaurant' | 'cafe' | 'izakaya';
  status?: 'available' | 'busy' | 'full' | 'closed';
  limit?: number;
  offset?: number;
}

export interface ShopSearchResult extends ShopResponse {
  distance_km: number;
}

// 認証用の型定義
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: SystemAdminResponse | ShopManagerResponse;
  token: string;
  expires_in: string;
}

// 空き状況更新用の型定義
export interface UpdateAvailabilityRequest {
  shop_id: string;
  status: 'available' | 'busy' | 'full' | 'closed';
  capacity?: number;
  current_occupancy?: number;
  notes?: string;
}
