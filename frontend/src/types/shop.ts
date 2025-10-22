// 店舗の型定義
export interface Shop {
  id: string;
  name: string;
  description?: string;
  address: string;
  postal_code?: string;          // 追加
  formatted_address?: string;     // 追加
  place_id?: string;              // 追加
  phone?: string;
  email?: string;
  category: 'restaurant' | 'cafe' | 'izakaya';
  latitude: number;
  longitude: number;
  business_hours?: {
    monday?: { open: string; close: string; close_next_day?: boolean };
    tuesday?: { open: string; close: string; close_next_day?: boolean };
    wednesday?: { open: string; close: string; close_next_day?: boolean };
    thursday?: { open: string; close: string; close_next_day?: boolean };
    friday?: { open: string; close: string; close_next_day?: boolean };
    saturday?: { open: string; close: string; close_next_day?: boolean };
    sunday?: { open: string; close: string; close_next_day?: boolean };
  };
  availability_status: 'available' | 'busy' | 'full' | 'closed';
  availability_updated_at?: string;
  rating?: number;
  distance?: number; // 現在地からの距離（m）
  image_url?: string; // 店舗画像URL
  is_active: boolean;
  geocoded_at?: string;           // 追加
  created_at: string;
  updated_at: string;
  shop_manager?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

// 空き状況の型定義
export type AvailabilityStatus = 'available' | 'busy' | 'full' | 'closed';

// 店舗カテゴリの型定義
export type ShopCategory = 'restaurant' | 'cafe' | 'izakaya';

// 位置情報の型定義
export interface Location {
  latitude: number;
  longitude: number;
}

// 検索フィルターの型定義
export interface SearchFilter {
  category?: ShopCategory;
  availability?: AvailabilityStatus;
  sortBy: 'distance' | 'rating' | 'name';
}
