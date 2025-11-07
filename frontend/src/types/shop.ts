/**
 * 営業時間の日ごとの設定
 */
export interface DayHours {
  open: string;           // HH:mm format
  close: string;          // HH:mm format
  close_next_day?: boolean; // 営業が翌日にかかる場合
  is_closed?: boolean;    // 定休日の場合
}

/**
 * 営業時間（週全体）
 */
export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

/**
 * 曜日の型
 */
export type DayOfWeek = keyof BusinessHours;

/**
 * 空き状況の型定義
 */
export type AvailabilityStatus = 'available' | 'busy' | 'full' | 'closed';

/**
 * 店舗カテゴリの型定義
 */
export type ShopCategory = 'restaurant' | 'cafe' | 'izakaya';

/**
 * 店舗マネージャー（シンプル版）
 */
export interface ShopManager {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

/**
 * 店舗の型定義
 */
export interface Shop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  postal_code: string | null;
  formatted_address: string | null;
  place_id: string | null;
  phone: string | null;
  email: string | null;
  category: ShopCategory;
  latitude: number;
  longitude: number;
  business_hours: BusinessHours;  // 必須に変更
  availability_status: AvailabilityStatus;
  availability_updated_at: string | null;
  rating: number | null;
  distance: number | null;         // 現在地からの距離（km）
  image_url: string | null;        // 店舗画像URL
  is_active: boolean;
  geocoded_at: string | null;
  created_at: string;
  updated_at: string;
  shop_manager: ShopManager | null; // shop_manager情報
}

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
