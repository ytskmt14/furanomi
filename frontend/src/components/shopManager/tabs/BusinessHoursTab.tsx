/**
 * 営業時間タブコンポーネント
 * 曜日別の営業時間を設定
 */

import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { ShopFormData } from '../hooks/useShopInfo';

const DAY_LABELS: Record<string, string> = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface BusinessHoursTabProps {
  /** フォームデータ */
  formData: ShopFormData;
  /** 営業時間更新コールバック */
  onBusinessHoursChange: (day: string, field: string, value: string | boolean) => void;
  /** 保存中か */
  isSaving: boolean;
  /** 保存ボタンクリック時のコールバック */
  onSave: () => Promise<void>;
}

/**
 * 営業時間タブコンポーネント
 *
 * @example
 * ```tsx
 * <BusinessHoursTab
 *   formData={formData}
 *   onBusinessHoursChange={handleBusinessHoursChange}
 *   isSaving={isSaving}
 *   onSave={handleSave}
 * />
 * ```
 */
export const BusinessHoursTab: React.FC<BusinessHoursTabProps> = ({
  formData,
  onBusinessHoursChange,
  isSaving,
  onSave,
}) => {
  return (
    <Card className="shadow-sm">
      <CardContent>
        <div className="space-y-4 sm:space-y-3">
          {DAYS.map((day) => {
            const hours = formData.business_hours[day] || { open: '', close: '' };
            return (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-0 border border-gray-200 rounded-lg sm:border-0 sm:rounded-none"
              >
                <div className="w-full sm:w-20 text-sm font-medium text-gray-700">
                  {DAY_LABELS[day]}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => onBusinessHoursChange(day, 'open', e.target.value)}
                      className="flex-1 sm:w-28 text-base sm:text-sm"
                    />
                    <span className="text-gray-500 text-lg sm:text-base">〜</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => onBusinessHoursChange(day, 'close', e.target.value)}
                      className="flex-1 sm:w-28 text-base sm:text-sm"
                    />
                  </div>
                  <div className="w-full sm:w-auto">
                    <Select
                      value={hours.close_next_day ? 'next' : 'same'}
                      onValueChange={(value) =>
                        onBusinessHoursChange(day, 'close_next_day', value === 'next')
                      }
                    >
                      <SelectTrigger className="w-full sm:w-24 text-sm h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same">同日</SelectItem>
                        <SelectItem value="next">翌日</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end pt-6 pb-6 border-t border-gray-200 mt-6">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                保存中...
              </div>
            ) : (
              '保存する'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
