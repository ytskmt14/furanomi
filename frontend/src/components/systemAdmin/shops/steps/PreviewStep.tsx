/**
 * 公開前確認・プレビューステップコンポーネント
 * 登録情報を確認し、公開前プレビューを表示する
 */

import React, { useState } from 'react';
import { Edit2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { ShopPreview } from './ShopPreview';
import { ShopOnboardingFormData, FormErrors } from '../types';
import { ShopManager } from '@/types/shop';

export interface PreviewStepProps {
  /** フォームデータ */
  formData: ShopOnboardingFormData;
  /** 利用可能な店舗管理者リスト */
  shopManagers: ShopManager[];
  /** エラーメッセージ */
  errors: FormErrors;
  /** ステップ編集時のコールバック */
  onEdit: (step: number) => void;
  /** 公開時のコールバック */
  onPublish: () => Promise<void>;
  /** 下書き保存時のコールバック */
  onSaveDraft: () => Promise<void>;
  /** 送信中か */
  isSubmitting: boolean;
}


/**
 * 公開前確認・プレビューステップコンポーネント
 * 
 * 登録情報を確認し、公開前プレビューを表示します。
 * 
 * @example
 * ```tsx
 * <PreviewStep
 *   formData={formData}
 *   shopManagers={shopManagers}
 *   errors={errors}
 *   onEdit={handleEdit}
 *   onPublish={handlePublish}
 *   onSaveDraft={handleSaveDraft}
 *   isSubmitting={isSubmitting}
 * />
 * ```
 */
export const PreviewStep: React.FC<PreviewStepProps> = ({
  formData,
  shopManagers,
  errors,
  onEdit,
  onPublish,
  onSaveDraft,
  isSubmitting,
}) => {
  const [publishMode, setPublishMode] = useState<'publish' | 'draft' | null>(null);

  // 店舗管理者名を取得
  const getManagerName = () => {
    if (formData.managerMode === 'existing' && formData.shop_manager_id) {
      const manager = shopManagers.find((m) => m.id === formData.shop_manager_id);
      if (manager) {
        return `${manager.first_name} ${manager.last_name} (${manager.username})`;
      }
    } else if (formData.managerMode === 'new' && formData.newManagerData) {
      return `${formData.newManagerData.firstName} ${formData.newManagerData.lastName} (新規作成)`;
    }
    return '（未設定）';
  };

  // 公開処理
  const handlePublish = async () => {
    setPublishMode('publish');
    try {
      await onPublish();
    } finally {
      setPublishMode(null);
    }
  };

  // 下書き保存処理
  const handleSaveDraft = async () => {
    setPublishMode('draft');
    try {
      await onSaveDraft();
    } finally {
      setPublishMode(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          公開前確認
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          入力した情報を確認してください。問題がなければ公開するか、後で公開するかを選択してください。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: 登録情報一覧 */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">登録情報</h4>

          {/* 基本情報 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-gray-900">基本情報</h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(1)}
                className="h-6 px-2 text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                編集
              </Button>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <span className="font-medium">店舗名:</span> {formData.name || '（未入力）'}
              </div>
              <div>
                <span className="font-medium">カテゴリ:</span>{' '}
                {formData.category === 'restaurant'
                  ? 'レストラン'
                  : formData.category === 'cafe'
                    ? 'カフェ'
                    : '居酒屋'}
              </div>
              {formData.description && (
                <div>
                  <span className="font-medium">説明:</span> {formData.description}
                </div>
              )}
            </div>
          </div>

          {/* 住所・位置情報 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-gray-900">住所・位置情報</h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(2)}
                className="h-6 px-2 text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                編集
              </Button>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <span className="font-medium">住所:</span> {formData.address || '（未入力）'}
              </div>
              {formData.formattedAddress && (
                <div>
                  <span className="font-medium">住所詳細:</span> {formData.formattedAddress}
                </div>
              )}
              <div>
                <span className="font-medium">位置情報:</span>{' '}
                {formData.latitude && formData.longitude
                  ? `緯度: ${Number(formData.latitude).toFixed(6)}, 経度: ${Number(formData.longitude).toFixed(6)}`
                  : '（未取得）'}
              </div>
              {formData.phone && (
                <div>
                  <span className="font-medium">電話:</span> {formData.phone}
                </div>
              )}
              {formData.email && (
                <div>
                  <span className="font-medium">メール:</span> {formData.email}
                </div>
              )}
            </div>
          </div>

          {/* 店舗管理者 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-gray-900">店舗管理者</h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(3)}
                className="h-6 px-2 text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                編集
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">管理者:</span> {getManagerName()}
            </div>
          </div>

          {/* 営業時間 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-gray-900">営業時間</h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(4)}
                className="h-6 px-2 text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                編集
              </Button>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              {Object.entries(formData.business_hours || {}).map(([day, hours]) => {
                const dayLabels: Record<string, string> = {
                  monday: '月',
                  tuesday: '火',
                  wednesday: '水',
                  thursday: '木',
                  friday: '金',
                  saturday: '土',
                  sunday: '日',
                };
                const display = hours.is_closed
                  ? '休業'
                  : hours.open && hours.close
                    ? `${hours.open} 〜 ${hours.close}${hours.close_next_day ? '（翌日）' : ''}`
                    : '（未設定）';
                return (
                  <div key={day} className="flex justify-between">
                    <span>{dayLabels[day]}:</span>
                    <span>{display}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 画像 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-gray-900">画像</h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(5)}
                className="h-6 px-2 text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                編集
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {formData.image_url ? (
                <span className="text-green-600">✓ 画像が設定されています</span>
              ) : (
                <span>（画像未設定）</span>
              )}
            </div>
          </div>
        </div>

        {/* 右側: 利用者アプリプレビュー */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">利用者アプリでの表示</h4>
          <ShopPreview formData={formData} />
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="flex-1"
        >
          {publishMode === 'draft' && isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            '後で公開する'
          )}
        </Button>
        <Button
          type="button"
          onClick={handlePublish}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {publishMode === 'publish' && isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              公開中...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              公開する
            </>
          )}
        </Button>
      </div>

      {/* エラーメッセージ */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            エラーが発生しました。各ステップを確認してください。
          </p>
        </div>
      )}
    </div>
  );
};

