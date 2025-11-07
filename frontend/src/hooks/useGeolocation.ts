/**
 * ジオロケーション（位置情報）を取得・管理するカスタムフック
 */

import { useState, useEffect, useCallback } from 'react';
import { GEOLOCATION_OPTIONS } from '../constants/ui';

/**
 * 位置情報
 */
export interface Geolocation {
  lat: number;
  lng: number;
}

/**
 * useGeolocation の戻り値
 */
export interface UseGeolocationReturn {
  location: Geolocation | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isSupported: boolean;
}

/**
 * ジオロケーションオプション
 */
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoFetch?: boolean;
}

/**
 * ジオロケーション情報を取得・管理するフック
 *
 * @param options オプション設定
 * @returns 位置情報と制御メソッド
 *
 * @example
 * ```tsx
 * const { location, loading, error, refetch } = useGeolocation();
 *
 * if (loading) return <div>位置情報を取得中...</div>;
 * if (error) return <div>エラー: {error.message}</div>;
 * if (!location) return <div>位置情報を許可してください</div>;
 *
 * return <Map center={location} />;
 * ```
 */
export function useGeolocation(options: GeolocationOptions = {}): UseGeolocationReturn {
  const [location, setLocation] = useState<Geolocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const {
    enableHighAccuracy = GEOLOCATION_OPTIONS.ENABLE_HIGH_ACCURACY,
    timeout = GEOLOCATION_OPTIONS.TIMEOUT,
    maximumAge = GEOLOCATION_OPTIONS.MAXIMUM_AGE,
    autoFetch = true,
  } = options;

  /**
   * 位置情報を取得
   */
  const fetchLocation = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      const err = new Error('このブラウザではジオロケーション機能がサポートされていません');
      setError(err);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setError(null);
          setLoading(false);
          resolve();
        },
        (err) => {
          let errorMessage = '位置情報の取得に失敗しました';

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'ユーザーが位置情報の共有を拒否しました';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = '位置情報が利用できません';
              break;
            case err.TIMEOUT:
              errorMessage = '位置情報の取得がタイムアウトしました';
              break;
          }

          const error = new Error(errorMessage);
          setError(error);
          setLocation(null);
          setLoading(false);
          resolve();
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [isSupported, enableHighAccuracy, timeout, maximumAge]);

  /**
   * コンポーネントマウント時に位置情報を自動取得
   */
  useEffect(() => {
    if (autoFetch && isSupported) {
      fetchLocation();
    }
  }, [autoFetch, isSupported, fetchLocation]);

  /**
   * 位置情報を再取得
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    loading,
    error,
    refetch,
    isSupported,
  };
}
