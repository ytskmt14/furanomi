/**
 * 再利用可能なテキストエリアフィールド
 */

import React, { TextareaHTMLAttributes } from 'react';
import { Label } from '../../../components/ui/label';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** ラベルテキスト */
  label: string;
  /** エラーメッセージ */
  error?: string;
  /** ヘルパーテキスト */
  helper?: string;
  /** フィールドが必須か */
  required?: boolean;
  /** 最大文字数 */
  maxLength?: number;
  /** 文字数カウントを表示するか */
  showCharCount?: boolean;
}

/**
 * テキストエリアフィールドコンポーネント
 *
 * @example
 * ```tsx
 * <FormTextarea
 *   label="説明"
 *   name="description"
 *   value={formData.description}
 *   onChange={handleChange}
 *   error={errors.description}
 *   maxLength={500}
 *   showCharCount
 *   required
 * />
 * ```
 */
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helper,
      required,
      maxLength,
      showCharCount,
      className,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = `form-textarea-${props.name}`;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={textareaId} className="font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {showCharCount && maxLength && (
            <span className={`text-sm ${charCount > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
              {charCount} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
            font-sans resize-vertical min-h-[100px]
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${className || ''}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helper ? `${textareaId}-helper` : undefined}
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-red-500 mt-1">
            {error}
          </p>
        )}

        {helper && !error && (
          <p id={`${textareaId}-helper`} className="text-sm text-gray-500 mt-1">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
