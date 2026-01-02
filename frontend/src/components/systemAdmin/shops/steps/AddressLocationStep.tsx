/**
 * 住所・位置情報入力ステップコンポーネント
 * 住所と位置情報を入力・取得する
 */

import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { FormField } from '../../../common/forms/FormField';
import { PostalCodeInput } from '../../PostalCodeInput';
import { ShopOnboardingFormData, FormErrors } from '../types';
import { apiService } from '@/services/api';

export interface AddressLocationStepProps {
  /** フォームデータ */
  formData: Pick<
    ShopOnboardingFormData,
    | 'postalCode'
    | 'address'
    | 'formattedAddress'
    | 'placeId'
    | 'latitude'
    | 'longitude'
    | 'phone'
    | 'email'
  >;
  /** フィールド変更時のコールバック */
  onChange: (field: keyof ShopOnboardingFormData, value: any) => void;
  /** エラーメッセージ */
  errors: FormErrors;
}

/**
 * 住所・位置情報入力ステップコンポーネント
 * 
 * 住所と位置情報を入力・取得します。
 * 
 * @example
 * ```tsx
 * <AddressLocationStep
 *   formData={formData}
 *   onChange={handleChange}
 *   errors={errors}
 * />
 * ```
 */
export const AddressLocationStep: React.FC<AddressLocationStepProps> = ({
  formData,
  onChange,
  errors,
}) => {
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleChange = (field: keyof ShopOnboardingFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(field, e.target.value);
  };

  // 郵便番号から住所を自動補完
  const handleAddressSelect = (addressData: {
    prefecture: string;
    city: string;
    town: string;
    fullAddress: string;
  }) => {
    onChange('address', addressData.fullAddress);
    // 住所が補完されたら自動的にGeocoding実行
    handleGeocode(addressData.fullAddress);
  };

  // 位置情報取得（Geocoding）
  const handleGeocode = async (addressOverride?: string) => {
    const addressToGeocode = addressOverride || formData.address;
    
    if (!addressToGeocode.trim()) {
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await apiService.geocode(addressToGeocode);
      onChange('latitude', result.latitude);
      onChange('longitude', result.longitude);
      onChange('formattedAddress', result.formatted_address);
      onChange('placeId', result.place_id);
    } catch (error: any) {
      console.error('Geocoding error:', error);
      // エラーは親コンポーネントで処理
    } finally {
      setIsGeocoding(false);
    }
  };

  // 位置情報が取得されているか
  const hasLocation = formData.latitude !== 0 && formData.longitude !== 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          住所・位置情報
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          店舗の住所と位置情報を入力してください。位置情報は必須です。
        </p>
      </div>

      <div className="space-y-4">
        {/* 郵便番号 */}
        <div>
          <PostalCodeInput
            value={formData.postalCode}
            onChange={(postalCode) => onChange('postalCode', postalCode)}
            onAddressSelect={handleAddressSelect}
          />
        </div>

        {/* 住所 */}
        <FormField
          label="住所"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange('address')}
          error={errors.address}
          required
          placeholder="例：東京都渋谷区渋谷1-1-1"
          helper="郵便番号から自動補完されるか、手動で入力してください"
        />

        {/* 住所詳細（番地・建物名） */}
        <FormField
          label="住所詳細（番地・建物名など）"
          name="formattedAddress"
          type="text"
          value={formData.formattedAddress}
          onChange={handleChange('formattedAddress')}
          error={errors.formattedAddress}
          placeholder="例：渋谷センター街123番地 ビジネスビル4階"
          helper="番地や建物名などの詳細情報を入力してください（任意）"
        />

        {/* 位置情報取得セクション */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              位置情報
            </h4>
            {hasLocation && (
              <span className="ml-auto text-xs text-green-600 font-medium">
                ✓ 取得済み
              </span>
            )}
          </div>

          {/* 緯度経度表示（読み取り専用） */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                緯度
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.latitude || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm"
                placeholder="0.000000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                経度
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.longitude || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm"
                placeholder="0.000000"
              />
            </div>
          </div>

          {/* 位置情報取得ボタン */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleGeocode()}
            disabled={isGeocoding || !formData.address.trim()}
            className="w-full"
          >
            {isGeocoding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                位置情報を取得中...
              </>
            ) : hasLocation ? (
              '位置情報を再取得'
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                位置情報を取得
              </>
            )}
          </Button>

          {errors.latitude && (
            <p className="text-sm text-red-500 mt-2">
              {errors.latitude}
            </p>
          )}
          {errors.longitude && (
            <p className="text-sm text-red-500 mt-2">
              {errors.longitude}
            </p>
          )}
        </div>

        {/* 連絡先情報 */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            連絡先情報（任意）
          </h4>

          <div className="space-y-4">
            {/* 電話番号 */}
            <FormField
              label="電話番号"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
              placeholder="例：03-1234-5678"
              helper="電話番号を入力してください（任意）"
            />

            {/* メールアドレス */}
            <FormField
              label="メールアドレス"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
              placeholder="例：info@example.com"
              helper="メールアドレスを入力してください（任意）"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

