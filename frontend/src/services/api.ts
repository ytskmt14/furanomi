// API サービスクラス
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    shop?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  role: 'shop_manager' | 'system_admin';
  shop?: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    category: string;
  } | null;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // HTTP-only cookies を送信
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 店舗管理者ログイン
  async shopManagerLogin(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/shop-manager/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // システム管理者ログイン
  async systemAdminLogin(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/system-admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // ログアウト
  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // 現在のユーザー情報取得
  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // トークン検証
  async verifyToken(): Promise<{ valid: boolean; user: any }> {
    return this.request<{ valid: boolean; user: any }>('/auth/verify');
  }

  // 店舗一覧取得
  async getShops(params?: {
    category?: string;
    status?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<{ shops: any[]; total: number; message: string }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/shops?${queryString}` : '/shops';
    
    return this.request<{ shops: any[]; total: number; message: string }>(endpoint);
  }

  // 位置情報ベース店舗検索
  async searchShopsByLocation(lat: number, lng: number, options?: {
    category?: string;
    status?: string;
    radius?: number; // km単位
  }): Promise<{ shops: any[]; total: number; message: string }> {
    return this.getShops({
      lat,
      lng,
      category: options?.category,
      status: options?.status,
      radius: options?.radius
    });
  }

  // 店舗詳細取得
  async getShop(id: string): Promise<any> {
    return this.request<any>(`/shops/${id}`);
  }

  // 店舗管理者の自分の店舗情報取得
  async getMyShop(): Promise<any> {
    return this.request<any>('/shops/my-shop');
  }

  // 店舗情報更新
  async updateShop(id: string, data: any): Promise<any> {
    return this.request<any>(`/shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 店舗作成（システム管理者のみ）
  async createShop(data: any): Promise<any> {
    return this.request<any>('/shops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 店舗削除（システム管理者のみ）
  async deleteShop(id: string): Promise<void> {
    return this.request<void>(`/shops/${id}`, {
      method: 'DELETE',
    });
  }

  // 空き状況更新
  async updateAvailability(shopId: string, status: string): Promise<any> {
    return this.request<any>(`/availability/${shopId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // 空き状況取得
  async getAvailability(shopId: string): Promise<any> {
    return this.request<any>(`/availability/${shopId}`);
  }

  // 全店舗の空き状況取得
  async getAllAvailability(status?: string): Promise<any[]> {
    const endpoint = status ? `/availability?status=${status}` : '/availability';
    return this.request<any[]>(endpoint);
  }

  // スタッフ用：トークンで店舗情報取得
  async getShopByStaffToken(token: string): Promise<any> {
    return this.request<any>(`/staff/shop/${token}`);
  }

  // スタッフ用：パスコード認証
  async authenticateStaff(token: string, passcode: string): Promise<any> {
    return this.request<any>(`/staff/auth/${token}`, {
      method: 'POST',
      body: JSON.stringify({ passcode }),
    });
  }

  // スタッフ用：空き状況更新
  async updateAvailabilityByStaff(token: string, passcode: string, status: string): Promise<any> {
    return this.request<any>(`/staff/availability/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ passcode, status }),
    });
  }

  // 店舗管理者用：スタッフ用アクセス情報取得
  async getStaffAccessInfo(shopId: string): Promise<any> {
    return this.request<any>(`/staff/access-info/${shopId}`);
  }

  // 店舗管理者用：スタッフ用アクセス情報更新
  async updateStaffAccessInfo(shopId: string, regenerateToken: boolean, regeneratePasscode: boolean): Promise<any> {
    return this.request<any>(`/staff/access-info/${shopId}`, {
      method: 'PUT',
      body: JSON.stringify({ regenerateToken, regeneratePasscode }),
    });
  }

  // システム管理者用：ダッシュボード統計
  async getDashboardStats(): Promise<any> {
    return this.request<any>('/system/dashboard/stats');
  }

  // システム管理者用：店舗管理者管理
  async getShopManagers(): Promise<any[]> {
    return this.request<any[]>('/system/shop-managers');
  }

  async createShopManager(data: any): Promise<any> {
    return this.request<any>('/system/shop-managers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShopManager(id: string, data: any): Promise<any> {
    return this.request<any>(`/system/shop-managers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShopManager(id: string): Promise<void> {
    return this.request<void>(`/system/shop-managers/${id}`, {
      method: 'DELETE',
    });
  }

  // システム管理者用：システム設定
  async getSystemSettings(): Promise<any> {
    return this.request<any>('/system/settings');
  }

  async updateSystemSettings(settings: any[]): Promise<any> {
    return this.request<any>('/system/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }

  // 逆ジオコーディング（位置情報から住所を取得）
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      // 簡易的な逆ジオコーディング（実際の実装ではGoogle Maps APIやOpenStreetMapのNominatimを使用）
      // 福岡県福岡市東区香椎周辺の座標範囲をチェック
      if (lat >= 33.6 && lat <= 33.7 && lng >= 130.4 && lng <= 130.5) {
        return '福岡県福岡市東区香椎';
      }
      
      // その他の場合は座標を表示
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}

export const apiService = new ApiService();
