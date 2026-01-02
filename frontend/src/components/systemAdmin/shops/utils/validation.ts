/**
 * バリデーション関数
 */

import { ShopOnboardingFormData, FormErrors } from '../types';

/**
 * ステップ1（基本情報）のバリデーション
 */
export function validateBasicInfo(
  formData: ShopOnboardingFormData
): FormErrors {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = '店舗名は必須です。例：ふらのみレストラン';
  } else if (formData.name.length > 200) {
    errors.name = `店舗名は200文字以内で入力してください（現在：${formData.name.length}文字）。例：ふらのみレストラン`;
  }

  if (!formData.category) {
    errors.category = 'カテゴリは必須です。レストラン、カフェ、居酒屋から選択してください';
  }

  return errors;
}

/**
 * ステップ2（住所・位置情報）のバリデーション
 */
export function validateAddressLocation(
  formData: ShopOnboardingFormData
): FormErrors {
  const errors: FormErrors = {};

  if (!formData.address.trim()) {
    errors.address = '住所は必須です。郵便番号から検索するか、手動で入力してください';
  }

  // 位置情報の必須チェック
  if (!formData.latitude || formData.latitude === 0 || !formData.longitude || formData.longitude === 0) {
    errors.latitude = '位置情報を取得してください。「位置情報を取得」ボタンをクリックしてください';
    errors.longitude = '位置情報を取得してください。「位置情報を取得」ボタンをクリックしてください';
  }

  // 電話番号の形式チェック（オプション）
  if (formData.phone && formData.phone.trim()) {
    // 数字、ハイフン、プラス、括弧のみ許可
    if (!/^[\d\-+()\s]+$/.test(formData.phone)) {
      errors.phone = '有効な電話番号を入力してください。例：03-1234-5678';
    }
  }

  // メールアドレスの形式チェック（オプション）
  if (formData.email && formData.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください。例：info@example.com';
    }
  }

  return errors;
}

/**
 * ステップ3（店舗管理者）のバリデーション
 */
export function validateShopManager(
  formData: ShopOnboardingFormData
): FormErrors {
  const errors: FormErrors = {};

  if (formData.managerMode === 'existing') {
    if (!formData.shop_manager_id || formData.shop_manager_id.trim() === '') {
      errors.shop_manager_id = '店舗管理者を選択してください。既存の店舗管理者から選択するか、新規作成してください';
    }
  } else if (formData.managerMode === 'new') {
    const newManager = formData.newManagerData;
    if (!newManager) {
      errors.shop_manager_id = '新規店舗管理者の情報を入力してください';
    } else {
      if (!newManager.username?.trim()) {
        errors['newManagerData.username'] = 'ユーザー名は必須です。例：manager_username';
      }
      if (!newManager.email?.trim()) {
        errors['newManagerData.email'] = 'メールアドレスは必須です';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newManager.email)) {
        errors['newManagerData.email'] = '有効なメールアドレスを入力してください。例：manager@example.com';
      }
      if (!newManager.password) {
        errors['newManagerData.password'] = 'パスワードは必須です';
      } else if (newManager.password.length < 6) {
        errors['newManagerData.password'] = 'パスワードは6文字以上で入力してください';
      }
      if (!newManager.firstName?.trim()) {
        errors['newManagerData.firstName'] = '名前は必須です。例：太郎';
      }
      if (!newManager.lastName?.trim()) {
        errors['newManagerData.lastName'] = '姓は必須です。例：山田';
      }
    }
  } else {
    // managerModeが設定されていない場合
    errors.shop_manager_id = '店舗管理者を選択するか、新規作成してください';
  }

  return errors;
}

/**
 * ステップ4（営業時間）のバリデーション
 */
export function validateBusinessHours(
  formData: ShopOnboardingFormData
): FormErrors {
  const errors: FormErrors = {};

  // 営業時間の形式チェック（HH:mm形式）
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

  if (formData.business_hours) {
    Object.entries(formData.business_hours).forEach(([day, hours]) => {
      // 休業日でない場合のみバリデーション
      if (!hours.is_closed) {
        // 開始時刻のチェック
        if (hours.open) {
          if (!timeRegex.test(hours.open)) {
            errors[`business_hours.${day}.open`] = '正しい時刻形式（HH:mm）で入力してください。例：09:00';
          }
        }
        
        // 終了時刻のチェック
        if (hours.close) {
          if (!timeRegex.test(hours.close)) {
            errors[`business_hours.${day}.close`] = '正しい時刻形式（HH:mm）で入力してください。例：21:00';
          }
        }
        
        // 開始時刻と終了時刻の両方が設定されている場合、開始時刻が終了時刻より前かチェック（同日の場合）
        if (hours.open && hours.close && !hours.close_next_day) {
          const [openHour, openMin] = hours.open.split(':').map(Number);
          const [closeHour, closeMin] = hours.close.split(':').map(Number);
          const openTime = openHour * 60 + openMin;
          const closeTime = closeHour * 60 + closeMin;
          
          if (openTime >= closeTime) {
            errors[`business_hours.${day}.close`] = '終了時刻は開始時刻より後である必要があります。翌日にまたがる場合は「翌日」チェックボックスを選択してください';
          }
        }
      }
    });
  }

  // 営業時間は必須ではない（未設定の場合はデフォルト値が適用される）
  // バリデーションエラーがない場合は空のオブジェクトを返す

  return errors;
}

/**
 * ステップ5（画像）のバリデーション
 */
export function validateImage(formData: ShopOnboardingFormData): FormErrors {
  const errors: FormErrors = {};

  // 画像はオプションなので、バリデーションは不要
  // ただし、画像が設定されている場合は形式チェックを行う
  if (formData.image_url && formData.image_url.trim() !== '') {
    // Base64形式のチェック（簡易版）
    if (!formData.image_url.startsWith('data:image/')) {
      errors.image_url = '有効な画像形式を選択してください。JPEGまたはPNG形式の画像を選択してください';
    }
  }

  return errors;
}

/**
 * 指定されたステップのバリデーションを実行
 */
export function validateStep(
  step: number,
  formData: ShopOnboardingFormData
): FormErrors {
  switch (step) {
    case 1:
      return validateBasicInfo(formData);
    case 2:
      return validateAddressLocation(formData);
    case 3:
      return validateShopManager(formData);
    case 4:
      return validateBusinessHours(formData);
    case 5:
      return validateImage(formData);
    default:
      return {};
  }
}

/**
 * エラーが発生した最初のフィールドまでスクロール
 */
export function scrollToFirstError(errors: FormErrors): void {
  const firstErrorField = Object.keys(errors)[0];
  if (firstErrorField) {
    const element = document.querySelector(
      `[name="${firstErrorField}"], [id="${firstErrorField}"]`
    );
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // フォーカスを設定
      if (element instanceof HTMLElement && 'focus' in element) {
        (element as HTMLElement).focus();
      }
    }
  }
}

