/**
 * 店舗登録フォーム状態管理フック
 */

import { useState, useCallback } from 'react';
import {
  ShopOnboardingFormData,
  FormErrors,
  INITIAL_FORM_DATA,
} from '../types';

export interface UseShopOnboardingFormReturn {
  formData: ShopOnboardingFormData;
  errors: FormErrors;
  updateField: (field: keyof ShopOnboardingFormData, value: any) => void;
  updateFields: (fields: Partial<ShopOnboardingFormData>) => void;
  setError: (field: string, message: string | undefined) => void;
  setErrors: (errors: FormErrors) => void;
  clearErrors: () => void;
  clearError: (field: string) => void;
  resetForm: () => void;
}

/**
 * 店舗登録フォームの状態管理フック
 * 
 * 全ステップのフォームデータを一元管理し、各ステップ間でデータを保持します。
 * エラー状態も管理します。
 * 
 * @example
 * ```tsx
 * const {
 *   formData,
 *   errors,
 *   updateField,
 *   setError,
 *   clearErrors
 * } = useShopOnboardingForm();
 * ```
 */
export function useShopOnboardingForm(
  initialData?: Partial<ShopOnboardingFormData>
): UseShopOnboardingFormReturn {
  const [formData, setFormData] = useState<ShopOnboardingFormData>(() => ({
    ...INITIAL_FORM_DATA,
    ...initialData,
  }));

  const [errors, setErrorsState] = useState<FormErrors>({});

  // 単一フィールドの更新
  const updateField = useCallback(
    (field: keyof ShopOnboardingFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // フィールド更新時にエラーをクリア
      if (errors[field]) {
        setErrorsState((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // 複数フィールドの更新
  const updateFields = useCallback(
    (fields: Partial<ShopOnboardingFormData>) => {
      setFormData((prev) => ({
        ...prev,
        ...fields,
      }));
      // 更新されたフィールドのエラーをクリア
      setErrorsState((prev) => {
        const newErrors = { ...prev };
        Object.keys(fields).forEach((key) => {
          delete newErrors[key];
        });
        return newErrors;
      });
    },
    []
  );

  // エラーの設定
  const setError = useCallback((field: string, message: string | undefined) => {
    setErrorsState((prev) => {
      if (message === undefined) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return {
        ...prev,
        [field]: message,
      };
    });
  }, []);

  // 複数エラーの設定
  const setErrors = useCallback((newErrors: FormErrors) => {
    setErrorsState(newErrors);
  }, []);

  // すべてのエラーをクリア
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  // 単一フィールドのエラーをクリア
  const clearError = useCallback((field: string) => {
    setError(field, undefined);
  }, [setError]);

  // フォームをリセット
  const resetForm = useCallback(() => {
    setFormData({
      ...INITIAL_FORM_DATA,
      ...initialData,
    });
    setErrorsState({});
  }, [initialData]);

  return {
    formData,
    errors,
    updateField,
    updateFields,
    setError,
    setErrors,
    clearErrors,
    clearError,
    resetForm,
  };
}

