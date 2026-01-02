/**
 * 基本情報入力ステップコンポーネント
 * 店舗の基本情報（店舗名、説明、カテゴリ）を入力する
 */

import React from 'react';
import { FormTextarea } from '../../../common/forms/FormTextarea';
import { FormSelect } from '../../../common/forms/FormSelect';
import { ShopOnboardingFormData, FormErrors } from '../types';

export interface ShopBasicInfoStepProps {
  /** フォームデータ */
  formData: Pick<ShopOnboardingFormData, 'name' | 'description' | 'category'>;
  /** フィールド変更時のコールバック */
  onChange: (field: keyof ShopOnboardingFormData, value: any) => void;
  /** エラーメッセージ */
  errors: FormErrors;
}

/**
 * 基本情報入力ステップコンポーネント
 * 
 * 店舗の基本情報（店舗名、説明、カテゴリ）を入力します。
 * 
 * @example
 * ```tsx
 * <ShopBasicInfoStep
 *   formData={formData}
 *   onChange={handleChange}
 *   errors={errors}
 * />
 * ```
 */
export const ShopBasicInfoStep: React.FC<ShopBasicInfoStepProps> = ({
  formData,
  onChange,
  errors,
}) => {
  const handleChange = (field: keyof ShopOnboardingFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onChange(field, e.target.value);
  };

  const categoryOptions = [
    { value: 'restaurant', label: 'レストラン' },
    { value: 'cafe', label: 'カフェ' },
    { value: 'izakaya', label: '居酒屋' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          基本情報
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          店舗の基本情報を入力してください。必須項目には<span className="text-red-500">*</span>マークが表示されます。
        </p>
      </div>

      <div className="space-y-4">
        {/* 店舗名 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              店舗名 <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${
              formData.name.length > 200 
                ? 'text-red-500' 
                : formData.name.length > 180 
                  ? 'text-amber-600' 
                  : 'text-gray-500'
            }`}>
              {formData.name.length} / 200
            </span>
          </div>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            maxLength={200}
            placeholder="例：ふらのみレストラン"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.name 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : 'name-helper'}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-red-500 mt-1">
              {errors.name}
            </p>
          )}
          {!errors.name && (
            <p id="name-helper" className="text-sm text-gray-500 mt-1">
              店舗名を入力してください（最大200文字）
            </p>
          )}
        </div>

        {/* カテゴリ */}
        <FormSelect
          label="カテゴリ"
          name="category"
          value={formData.category}
          onChange={handleChange('category')}
          options={categoryOptions}
          error={errors.category}
          required
          helper="店舗のカテゴリを選択してください"
        />

        {/* 店舗説明 */}
        <FormTextarea
          label="説明"
          name="description"
          value={formData.description}
          onChange={handleChange('description')}
          error={errors.description}
          placeholder="店舗の特徴やおすすめメニューなどを入力してください"
          helper="店舗の説明を入力してください（任意）"
          rows={4}
          showCharCount
          maxLength={1000}
        />
      </div>
    </div>
  );
};

