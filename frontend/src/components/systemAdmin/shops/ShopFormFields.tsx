/**
 * 店舗フォームフィールドコンポーネント
 * 住所、郵便番号、位置情報関連のフィールド
 */

import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { PostalCodeInput } from '../PostalCodeInput';

interface ShopFormFieldsProps {
  /** フォームデータ */
  formData: {
    postalCode: string;
    address: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
    placeId: string;
    phone: string;
    email: string;
  };
  /** フォーム入力変更 */
  onChange: (field: string, value: any) => void;
  /** 郵便番号選択時 */
  onAddressSelect: (addressData: any) => void;
  /** ジオコーディング中か */
  isGeocoding: boolean;
  /** ジオコーディングボタンクリック */
  onGeocode: () => void;
}

/**
 * 店舗フォームフィールドコンポーネント
 *
 * @example
 * ```tsx
 * <ShopFormFields
 *   formData={formData}
 *   onChange={handleFormChange}
 *   onAddressSelect={handleAddressSelect}
 *   isGeocoding={isGeocoding}
 *   onGeocode={handleGeocode}
 * />
 * ```
 */
export const ShopFormFields: React.FC<ShopFormFieldsProps> = ({
  formData,
  onChange,
  onAddressSelect,
  isGeocoding,
  onGeocode,
}) => {
  return (
    <>
      {/* 郵便番号 */}
      <div>
        <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
          郵便番号
        </Label>
        <PostalCodeInput
          value={formData.postalCode}
          onChange={(postalCode) => onChange('postalCode', postalCode)}
          onAddressSelect={onAddressSelect}
        />
      </div>

      {/* 住所 */}
      <div>
        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
          住所 *
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onChange('address', e.target.value)}
          onBlur={onGeocode}
          className="mt-1"
          placeholder="東京都渋谷区..."
          required
        />
      </div>

      {/* 住所詳細 */}
      <div>
        <Label htmlFor="formattedAddress" className="text-sm font-medium text-gray-700">
          住所詳細（番地・建物名など）
        </Label>
        <Input
          id="formattedAddress"
          value={formData.formattedAddress}
          onChange={(e) => onChange('formattedAddress', e.target.value)}
          className="mt-1"
          placeholder="渋谷センター街123番地 ビジネスビル4階"
        />
      </div>

      {/* 位置情報 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude" className="text-sm font-medium text-gray-700">
            緯度
          </Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            value={formData.latitude}
            readOnly
            className="mt-1 bg-gray-50"
            placeholder="0.000000"
          />
        </div>
        <div>
          <Label htmlFor="longitude" className="text-sm font-medium text-gray-700">
            経度
          </Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            value={formData.longitude}
            readOnly
            className="mt-1 bg-gray-50"
            placeholder="0.000000"
          />
        </div>
      </div>

      {/* 位置情報取得ボタン */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={onGeocode}
          disabled={isGeocoding}
          className="w-full"
        >
          {isGeocoding ? '位置情報を取得中...' : '位置情報を再取得'}
        </Button>
      </div>

      {/* 電話 */}
      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          電話番号
        </Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="mt-1"
          placeholder="03-1234-5678"
        />
      </div>

      {/* メール */}
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          メールアドレス
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="mt-1"
          placeholder="info@example.com"
        />
      </div>
    </>
  );
};
