// 店舗管理者用の型定義

export interface ShopManager {
  id: string;
  username: string;
  email: string;
  last_name: string;
  first_name: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface StaffAccess {
  token: string;
  passcode: string;
  tokenCreatedAt: Date;
  qrCodeUrl: string;
}

export interface ShopManagerShop {
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
  availability?: ShopAvailability;
  images?: ShopImage[];
  staff_access?: StaffAccess;
}

export interface BusinessHours {
  monday: { open: string; close: string; close_next_day?: boolean };
  tuesday: { open: string; close: string; close_next_day?: boolean };
  wednesday: { open: string; close: string; close_next_day?: boolean };
  thursday: { open: string; close: string; close_next_day?: boolean };
  friday: { open: string; close: string; close_next_day?: boolean };
  saturday: { open: string; close: string; close_next_day?: boolean };
  sunday: { open: string; close: string; close_next_day?: boolean };
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

// フォーム用の型定義
export interface ShopFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  category: 'restaurant' | 'cafe' | 'izakaya';
  business_hours: BusinessHours;
  image_url: string;
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
