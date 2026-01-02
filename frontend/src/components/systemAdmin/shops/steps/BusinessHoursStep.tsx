/**
 * 営業時間設定ステップコンポーネント
 * 各曜日ごとに営業時間を設定する
 */

import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Button } from '../../../ui/button';
import { ShopOnboardingFormData, FormErrors, DEFAULT_BUSINESS_HOURS } from '../types';
import { BusinessHours } from '@/types/shop';

export interface BusinessHoursStepProps {
  /** フォームデータ */
  formData: Pick<ShopOnboardingFormData, 'business_hours'>;
  /** フィールド変更時のコールバック */
  onChange: (field: keyof ShopOnboardingFormData, value: any) => void;
  /** エラーメッセージ */
  errors: FormErrors;
}

const DAY_LABELS: Record<string, string> = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
};

const DAYS: (keyof BusinessHours)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/**
 * 営業時間設定ステップコンポーネント
 * 
 * 各曜日ごとに営業時間を設定します。
 * 
 * @example
 * ```tsx
 * <BusinessHoursStep
 *   formData={formData}
 *   onChange={handleChange}
 *   errors={errors}
 * />
 * ```
 */
export const BusinessHoursStep: React.FC<BusinessHoursStepProps> = ({
  formData,
  onChange,
  errors,
}) => {
  // 営業時間変更ハンドラ
  const handleBusinessHoursChange = (
    day: keyof BusinessHours,
    field: 'open' | 'close' | 'close_next_day' | 'is_closed',
    value: string | boolean
  ) => {
    const currentHours = formData.business_hours[day] || {
      open: '',
      close: '',
      close_next_day: false,
      is_closed: false,
    };

    const updatedHours = {
      ...currentHours,
      [field]: value,
    };

    // 休業日に設定した場合、時刻をクリア
    if (field === 'is_closed' && value === true) {
      updatedHours.open = '';
      updatedHours.close = '';
      updatedHours.close_next_day = false;
    }

    // 営業時間を更新
    onChange('business_hours', {
      ...formData.business_hours,
      [day]: updatedHours,
    });
  };

  // デフォルト値適用（9:00-21:00）
  const handleApplyDefault = () => {
    onChange('business_hours', DEFAULT_BUSINESS_HOURS);
  };

  // すべての曜日を休業日に設定
  const handleSetAllClosed = () => {
    const closedHours: BusinessHours = {
      monday: { open: '', close: '', is_closed: true },
      tuesday: { open: '', close: '', is_closed: true },
      wednesday: { open: '', close: '', is_closed: true },
      thursday: { open: '', close: '', is_closed: true },
      friday: { open: '', close: '', is_closed: true },
      saturday: { open: '', close: '', is_closed: true },
      sunday: { open: '', close: '', is_closed: true },
    };
    onChange('business_hours', closedHours);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          営業時間の設定
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          各曜日ごとの営業時間を設定してください。未設定の場合はデフォルト値（9:00-21:00）が適用されます。
        </p>
      </div>

      {/* 一括操作ボタン */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleApplyDefault}
        >
          デフォルト値（9:00-21:00）を適用
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSetAllClosed}
        >
          すべて休業日に設定
        </Button>
      </div>

      {/* 営業時間入力フォーム */}
      <div className="space-y-4">
        {DAYS.map((day) => {
          const hours = formData.business_hours[day] || {
            open: '',
            close: '',
            close_next_day: false,
            is_closed: false,
          };
          const dayError = errors[`business_hours.${day}.open`] || errors[`business_hours.${day}.close`];

          return (
            <div
              key={day}
              className={`p-4 border rounded-lg ${
                dayError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-900">
                  {DAY_LABELS[day]}
                </Label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hours.is_closed || false}
                    onChange={(e) =>
                      handleBusinessHoursChange(day, 'is_closed', e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">休業日</span>
                </label>
              </div>

              {!hours.is_closed && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1 block">
                      開始時刻
                    </Label>
                    <Input
                      type="time"
                      value={hours.open || ''}
                      onChange={(e) =>
                        handleBusinessHoursChange(day, 'open', e.target.value)
                      }
                      className="w-full"
                      placeholder="09:00"
                    />
                    {errors[`business_hours.${day}.open`] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[`business_hours.${day}.open`]}
                      </p>
                    )}
                  </div>

                  <span className="text-gray-500 pt-6">〜</span>

                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1 block">
                      終了時刻
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={hours.close || ''}
                        onChange={(e) =>
                          handleBusinessHoursChange(day, 'close', e.target.value)
                        }
                        className="flex-1"
                        placeholder="21:00"
                      />
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={hours.close_next_day || false}
                          onChange={(e) =>
                            handleBusinessHoursChange(
                              day,
                              'close_next_day',
                              e.target.checked
                            )
                          }
                          className="rounded"
                        />
                        <span>翌日</span>
                      </label>
                    </div>
                    {errors[`business_hours.${day}.close`] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[`business_hours.${day}.close`]}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {hours.is_closed && (
                <p className="text-sm text-gray-500 italic">休業日</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ヘルプテキスト */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>ヒント:</strong> 時刻はHH:mm形式で入力してください（例：09:00、21:00）。
          営業が翌日にまたがる場合は「翌日」チェックボックスを選択してください。
        </p>
      </div>
    </div>
  );
};

