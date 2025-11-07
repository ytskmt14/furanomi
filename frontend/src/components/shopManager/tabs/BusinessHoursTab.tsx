/**
 * 営業時間タブコンポーネント
 * 曜日別の営業時間を設定
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
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
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">営業時間</h3>
        <p className="text-sm text-gray-600">曜日別の営業時間を設定</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS.map((day) => {
            const hours = formData.business_hours[day] || { open: '', close: '' };
            return (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium text-gray-700">
                  {DAY_LABELS[day]}
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(e) => onBusinessHoursChange(day, 'open', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-gray-500">〜</span>
                  <div className="flex items-center space-x-1">
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => onBusinessHoursChange(day, 'close', e.target.value)}
                      className="w-24"
                    />
                    <select
                      value={hours.close_next_day ? 'next' : 'same'}
                      onChange={(e) => onBusinessHoursChange(day, 'close_next_day', e.target.value === 'next')}
                      className="text-xs px-1 py-1 border border-gray-300 rounded"
                    >
                      <option value="same">同日</option>
                      <option value="next">翌日</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end pt-6 pb-6 border-t border-gray-200">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
