/**
 * 再利用可能なセレクト（選択肢）フィールド
 */

import React, { SelectHTMLAttributes } from 'react';
import { Label } from '../../../components/ui/label';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** ラベルテキスト */
  label: string;
  /** 選択肢 */
  options: Array<{ value: string; label: string }>;
  /** エラーメッセージ */
  error?: string;
  /** ヘルパーテキスト */
  helper?: string;
  /** フィールドが必須か */
  required?: boolean;
  /** プレースホルダーテキスト */
  placeholder?: string;
}

/**
 * セレクトフィールドコンポーネント
 *
 * @example
 * ```tsx
 * <FormSelect
 *   label="カテゴリー"
 *   name="category"
 *   value={formData.category}
 *   onChange={handleChange}
 *   options={[
 *     { value: 'restaurant', label: 'レストラン' },
 *     { value: 'cafe', label: 'カフェ' },
 *   ]}
 *   error={errors.category}
 *   required
 * />
 * ```
 */
export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    { label, error, helper, required, options, placeholder, className, ...props },
    ref
  ) => {
    const selectId = `form-select-${props.name}`;

    return (
      <div className="space-y-2">
        <Label htmlFor={selectId} className="font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${className || ''}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helper ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-500 mt-1">
            {error}
          </p>
        )}

        {helper && !error && (
          <p id={`${selectId}-helper`} className="text-sm text-gray-500 mt-1">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
