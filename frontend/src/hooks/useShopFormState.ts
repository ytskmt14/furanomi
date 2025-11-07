/**
 * 店舗編集フォームの状態管理フック
 */

import { useState, useCallback, useRef } from 'react';
import { Shop, BusinessHours, DayOfWeek, ShopFormData } from '../types/shop';
import { FORM_CONSTRAINTS } from '../constants/ui';

/**
 * フォーム検証エラー
 */
export interface FormErrors {
  [key: string]: string;
}

/**
 * useShopFormState の戻り値
 */
export interface UseShopFormStateReturn {
  formData: ShopFormData;
  updateField: (name: keyof ShopFormData, value: unknown) => void;
  updateBusinessHours: (day: DayOfWeek, field: 'open' | 'close' | 'close_next_day', value: string | boolean) => void;
  updateImage: (file: File | null) => Promise<void>;
  resetForm: (shop?: Shop) => void;
  isDirty: boolean;
  errors: FormErrors;
  validate: () => boolean;
  clearErrors: () => void;
  setError: (field: string, message: string) => void;
}

/**
 * デフォルトのビジネスアワーズ
 */
const createDefaultBusinessHours = (): BusinessHours => ({
  monday: { open: '10:00', close: '22:00' },
  tuesday: { open: '10:00', close: '22:00' },
  wednesday: { open: '10:00', close: '22:00' },
  thursday: { open: '10:00', close: '22:00' },
  friday: { open: '10:00', close: '23:00' },
  saturday: { open: '10:00', close: '23:00' },
  sunday: { open: '10:00', close: '22:00' },
});

/**
 * デフォルトのフォームデータ
 */
const createDefaultFormData = (): ShopFormData => ({
  name: '',
  description: null,
  address: '',
  postal_code: null,
  formatted_address: null,
  place_id: null,
  phone: null,
  email: null,
  category: 'restaurant',
  latitude: 0,
  longitude: 0,
  business_hours: createDefaultBusinessHours(),
  image_url: null,
  is_active: false,
});

/**
 * 店舗編集フォーム状態管理フック
 *
 * @param initialShop 初期店舗データ（編集時）
 * @returns フォーム管理機能
 *
 * @example
 * ```tsx
 * const {
 *   formData,
 *   updateField,
 *   updateBusinessHours,
 *   isDirty,
 *   errors,
 *   validate,
 * } = useShopFormState(shop);
 *
 * const handleSubmit = async () => {
 *   if (!validate()) return;
 *
 *   await apiService.updateShop(shop.id, formData);
 * };
 * ```
 */
export function useShopFormState(initialShop?: Shop): UseShopFormStateReturn {
  const initialDataRef = useRef<ShopFormData>(
    initialShop
      ? {
          name: initialShop.name,
          description: initialShop.description,
          address: initialShop.address,
          postal_code: initialShop.postal_code,
          formatted_address: initialShop.formatted_address,
          place_id: initialShop.place_id,
          phone: initialShop.phone,
          email: initialShop.email,
          category: initialShop.category,
          latitude: initialShop.latitude,
          longitude: initialShop.longitude,
          business_hours: initialShop.business_hours,
          image_url: initialShop.image_url,
          is_active: initialShop.is_active,
        }
      : createDefaultFormData()
  );

  const [formData, setFormData] = useState<ShopFormData>(initialDataRef.current);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * フォームが変更されているかチェック
   */
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialDataRef.current);

  /**
   * フィールドを更新
   */
  const updateField = useCallback((name: keyof ShopFormData, value: unknown) => {
    setFormData((prev: ShopFormData): ShopFormData => {
      const updated = { ...prev, [name]: value };

      // フィールド固有の検証
      const newErrors = { ...errors };
      switch (name) {
        case 'name':
          if (!value || (typeof value === 'string' && value.trim().length === 0)) {
            newErrors.name = '店舗名は必須です';
          } else if (typeof value === 'string' && value.length > FORM_CONSTRAINTS.SHOP_NAME_MAX_LENGTH) {
            newErrors.name = `店舗名は${FORM_CONSTRAINTS.SHOP_NAME_MAX_LENGTH}文字以内です`;
          } else {
            delete newErrors.name;
          }
          break;

        case 'address':
          if (!value || (typeof value === 'string' && value.trim().length === 0)) {
            newErrors.address = '住所は必須です';
          } else if (typeof value === 'string' && value.length > FORM_CONSTRAINTS.ADDRESS_MAX_LENGTH) {
            newErrors.address = `住所は${FORM_CONSTRAINTS.ADDRESS_MAX_LENGTH}文字以内です`;
          } else {
            delete newErrors.address;
          }
          break;

        case 'email':
          if (value && typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              newErrors.email = '有効なメールアドレスを入力してください';
            } else {
              delete newErrors.email;
            }
          } else {
            delete newErrors.email;
          }
          break;

        case 'phone':
          if (value && typeof value === 'string') {
            const phoneRegex = /^[\d\-+()]+$/;
            if (!phoneRegex.test(value)) {
              newErrors.phone = '有効な電話番号を入力してください';
            } else if (value.length > FORM_CONSTRAINTS.PHONE_MAX_LENGTH) {
              newErrors.phone = `電話番号は${FORM_CONSTRAINTS.PHONE_MAX_LENGTH}文字以内です`;
            } else {
              delete newErrors.phone;
            }
          } else {
            delete newErrors.phone;
          }
          break;

        case 'description':
          if (
            value &&
            typeof value === 'string' &&
            value.length > FORM_CONSTRAINTS.DESCRIPTION_MAX_LENGTH
          ) {
            newErrors.description = `説明は${FORM_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}文字以内です`;
          } else {
            delete newErrors.description;
          }
          break;
      }

      setErrors(newErrors);
      return updated;
    });
  }, [errors]);

  /**
   * 営業時間を更新
   */
  const updateBusinessHours = useCallback(
    (day: DayOfWeek, field: 'open' | 'close' | 'close_next_day', value: string | boolean) => {
      setFormData((prev: ShopFormData): ShopFormData => ({
        ...prev,
        business_hours: {
          ...prev.business_hours,
          [day]: {
            ...prev.business_hours[day],
            [field]: value,
          },
        },
      }));
    },
    []
  );

  /**
   * 画像を更新
   */
  const updateImage = useCallback(async (file: File | null): Promise<void> => {
    if (!file) {
      setFormData((prev: ShopFormData): ShopFormData => ({ ...prev, image_url: null }));
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      throw new Error('画像ファイルを選択してください');
    }

    // ファイルサイズチェック
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('ファイルサイズは5MB以下にしてください');
    }

    // ファイルをArrayBufferに変換して保存
    const reader = new FileReader();

    return new Promise<void>((resolve, reject) => {
      reader.onload = () => {
        const dataUrl = URL.createObjectURL(file);
        setFormData((prev: ShopFormData): ShopFormData => ({ ...prev, image_url: dataUrl }));
        resolve();
      };

      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };

      reader.readAsArrayBuffer(file);
    });
  }, []);

  /**
   * フォームをリセット
   */
  const resetForm = useCallback((shop?: Shop) => {
    const newInitialData: ShopFormData = shop
      ? {
          name: shop.name,
          description: shop.description,
          address: shop.address,
          postal_code: shop.postal_code,
          formatted_address: shop.formatted_address,
          place_id: shop.place_id,
          phone: shop.phone,
          email: shop.email,
          category: shop.category,
          latitude: shop.latitude,
          longitude: shop.longitude,
          business_hours: shop.business_hours,
          image_url: shop.image_url,
          is_active: shop.is_active,
        }
      : createDefaultFormData();

    initialDataRef.current = newInitialData;
    setFormData(newInitialData);
    setErrors({});
  }, []);

  /**
   * フォームを検証
   */
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // 必須フィールド
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = '店舗名は必須です';
    }
    if (!formData.address || formData.address.trim().length === 0) {
      newErrors.address = '住所は必須です';
    }

    // 長さチェック
    if (formData.name && formData.name.length > FORM_CONSTRAINTS.SHOP_NAME_MAX_LENGTH) {
      newErrors.name = `店舗名は${FORM_CONSTRAINTS.SHOP_NAME_MAX_LENGTH}文字以内です`;
    }
    if (formData.address && formData.address.length > FORM_CONSTRAINTS.ADDRESS_MAX_LENGTH) {
      newErrors.address = `住所は${FORM_CONSTRAINTS.ADDRESS_MAX_LENGTH}文字以内です`;
    }

    // メールバリデーション
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = '有効なメールアドレスを入力してください';
      }
    }

    // 電話番号バリデーション
    if (formData.phone) {
      const phoneRegex = /^[\d\-+()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '有効な電話番号を入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * エラーをクリア
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * エラーを設定
   */
  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return {
    formData,
    updateField,
    updateBusinessHours,
    updateImage,
    resetForm,
    isDirty,
    errors,
    validate,
    clearErrors,
    setError,
  };
}
