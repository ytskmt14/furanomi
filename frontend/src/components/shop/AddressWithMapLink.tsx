/**
 * 住所とGoogleMapリンクコンポーネント
 * 座標検証とマップリンク生成を行う
 */

import React, { useMemo } from 'react';

interface AddressWithMapLinkProps {
  /** 住所 */
  address: string;
  /** 緯度 */
  latitude?: number;
  /** 経度 */
  longitude?: number;
}

/**
 * 住所とGoogleMapsリンクを表示
 *
 * @example
 * ```tsx
 * <AddressWithMapLink
 *   address="東京都渋谷区"
 *   latitude={35.6595}
 *   longitude={139.7004}
 * />
 * ```
 */
export const AddressWithMapLink: React.FC<AddressWithMapLinkProps> = ({
  address,
  latitude,
  longitude,
}) => {
  const mapsLink = useMemo(() => {
    // 座標を数値に変換してチェック
    const lat =
      typeof latitude === 'string' ? parseFloat(latitude) : Number(latitude);
    const lng =
      typeof longitude === 'string'
        ? parseFloat(longitude)
        : Number(longitude);

    const hasValidCoords =
      lat != null &&
      lng != null &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      Math.abs(lat) > 0.0001 &&
      Math.abs(lng) > 0.0001;

    if (hasValidCoords) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    } else if (address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
    }

    return null;
  }, [latitude, longitude, address]);

  if (!mapsLink) {
    return null;
  }

  return (
    <a
      href={mapsLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold tracking-wide text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100"
      aria-label="地図で開く"
      onClick={(e) => e.stopPropagation()}
    >
      MAP
    </a>
  );
};
