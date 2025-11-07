/**
 * 再利用可能なフォーム入力フィールド
 * ラベル + 入力フィールド + エラーメッセージ の組み合わせ
 */

import React, { InputHTMLAttributes } from 'react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** ラベルテキスト */
  label: string;
  /** エラーメッセージ */
  error?: string;
  /** ヘルパーテキスト */
  helper?: string;
  /** フィールドが必須か */
  required?: boolean;
}

/**
 * フォーム入力フィールドコンポーネント
 *
 * @example
 * ```tsx
 * <FormField
 *   label="店舗名"
 *   name="name"
 *   value={formData.name}
 *   onChange={handleChange}
 *   error={errors.name}
 *   required
 * />
 * ```
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helper, required, className, ...props }, ref) => {
    const inputId = `form-field-${props.name}`;

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId} className="font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        <Input
          ref={ref}
          id={inputId}
          className={`${error ? 'border-red-500 focus:ring-red-500' : ''} ${className || ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500 mt-1">
            {error}
          </p>
        )}

        {helper && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500 mt-1">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
