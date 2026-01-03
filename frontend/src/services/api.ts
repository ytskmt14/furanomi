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

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      return response.json();
    } catch (error: any) {
      // ネットワークエラーやタイムアウトの処理
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('ネットワークエラー: サーバーに接続できませんでした');
      }
      throw error;
    }
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
  // 注意: radiusを指定しない場合、バックエンドのシステム設定（search_radius）が使用されます
  async searchShopsByLocation(lat: number, lng: number, options?: {
    category?: string;
    status?: string;
    radius?: number; // km単位（指定しない場合はシステム設定を使用）
  }): Promise<{ shops: any[]; total: number; message: string }> {
    return this.getShops({
      lat,
      lng,
      category: options?.category,
      status: options?.status,
      // radiusを明示的に指定した場合のみ渡す（未指定の場合はバックエンドのシステム設定を使用）
      ...(options?.radius !== undefined && { radius: options.radius })
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

  // 店舗更新（システム管理者のみ）
  async updateShopBySystemAdmin(id: string, data: any): Promise<any> {
    return this.request<any>(`/shops/system/${id}`, {
      method: 'PUT',
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

  // ジオコーディング（住所から位置情報を取得）
  async geocode(address: string): Promise<{ latitude: number; longitude: number; formatted_address: string; place_id: string }> {
    return this.request<{ latitude: number; longitude: number; formatted_address: string; place_id: string }>('/system/geocode', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  // 郵便番号から住所を検索
  async searchPostalCode(postalCode: string): Promise<{
    results: Array<{
      postalCode: string;
      prefecture: string;
      city: string;
      town: string;
      prefectureKana: string;
      cityKana: string;
      townKana: string;
    }>;
  }> {
    return this.request<any>(`/system/postal-code/${postalCode}`);
  }

  // 利用者認証：登録
  async registerUser(data: { email: string; password: string; name: string; phone?: string }): Promise<any> {
    return this.request<any>('/user-auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 利用者認証：ログイン
  async loginUser(email: string, password: string): Promise<any> {
    return this.request<any>('/user-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // 利用者認証：ログアウト
  async logoutUser(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/user-auth/logout', {
      method: 'POST',
    });
  }

  // 利用者認証：現在のユーザー情報取得
  async getCurrentUserAuth(): Promise<any> {
    return this.request<any>('/user-auth/me');
  }

  // 利用者プロフィール更新（ニックネームのみ）
  async updateUserProfile(data: { name: string }): Promise<any> {
    return this.request<any>('/user-auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 利用者認証：パスワードリセット要求
  async requestPasswordReset(email: string): Promise<any> {
    return this.request<any>('/user-auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // 利用者認証：パスワードリセット確認
  async confirmPasswordReset(token: string, newPassword: string): Promise<any> {
    return this.request<any>('/user-auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // 店舗機能設定：取得
  async getShopFeatures(shopId: string): Promise<{ features: Record<string, boolean> }> {
    return this.request<{ features: Record<string, boolean> }>(`/shops/${shopId}/features`);
  }

  // 店舗機能設定：更新（システム管理者のみ）
  async updateShopFeature(shopId: string, featureName: string, enabled: boolean): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/shops/${shopId}/features`, {
      method: 'PUT',
      body: JSON.stringify({ featureName, enabled }),
    });
  }

  // 店舗機能設定：一括更新（システム管理者のみ）
  async updateShopFeaturesBulk(shopId: string, features: Record<string, boolean>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/shops/${shopId}/features/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ features }),
    });
  }

  // 予約関連API
  async createReservation(shopId: string, partySize: number, arrivalTimeEstimate: string): Promise<any> {
    return this.request<any>('/reservations', {
      method: 'POST',
      body: JSON.stringify({ shopId, partySize, arrivalTimeEstimate }),
    });
  }

  async getMyReservations(): Promise<any> {
    return this.request<any>('/reservations/my');
  }

  async getReservation(id: string): Promise<any> {
    return this.request<any>(`/reservations/${id}`);
  }

  async cancelReservation(id: string): Promise<any> {
    return this.request<any>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  async getShopReservations(shopId: string): Promise<any> {
    return this.request<any>(`/reservations/shop/${shopId}`);
  }

  async approveReservation(id: string): Promise<any> {
    return this.request<any>(`/reservations/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectReservation(id: string, rejectionReason?: string): Promise<any> {
    return this.request<any>(`/reservations/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  // --- お気に入り（利用者） ---
  async getFavorites(): Promise<{ favorites: string[] }> {
    return this.request<{ favorites: string[] }>(`/user/favorites`);
  }

  async addFavorite(shopId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/user/favorites/${shopId}`, {
      method: 'POST',
    });
  }

  async removeFavorite(shopId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/user/favorites/${shopId}`, {
      method: 'DELETE',
    });
  }

  // --- 利用者向けPush購読 ---
  async getUserVapidPublicKey(): Promise<{ publicKey: string }> {
    return this.request<{ publicKey: string }>(`/user/notifications/vapid-public-key`);
  }

  async subscribeUserPush(data: { endpoint: string; p256dh: string; auth: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/user/notifications/subscribe`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unsubscribeUserPush(): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/user/notifications/unsubscribe`, {
      method: 'POST',
    });
  }

  // --- 店舗管理者向けPush購読 ---
  async getShopManagerVapidPublicKey(): Promise<{ publicKey: string }> {
    return this.request<{ publicKey: string }>(`/notifications/vapid-public-key`);
  }

  async subscribeShopManagerPush(data: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/subscribe`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unsubscribeShopManagerPush(): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/unsubscribe`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
