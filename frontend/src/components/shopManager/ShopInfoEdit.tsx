/**
 * 店舗情報編集ページ
 * タブベースのUI で店舗情報を管理
 */

import React, { useState } from 'react';
import { Store, Clock, Phone } from 'lucide-react';
import { useShopInfo } from './hooks/useShopInfo';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { BusinessHoursTab } from './tabs/BusinessHoursTab';
import { ContactTab } from './tabs/ContactTab';

/**
 * 店舗情報編集コンポーネント
 *
 * @example
 * ```tsx
 * <ShopInfoEdit />
 * ```
 */
export const ShopInfoEdit: React.FC = () => {
  const { shop, formData, loading, error, isSaving, updateFormData, updateBusinessHours, save } = useShopInfo();
  const [activeTab, setActiveTab] = useState<'basic' | 'hours' | 'contact'>('basic');

  const tabs = [
    { id: 'basic', label: '基本情報', icon: <Store className="w-4 h-4" /> },
    { id: 'hours', label: '営業時間', icon: <Clock className="w-4 h-4" /> },
    { id: 'contact', label: '連絡先', icon: <Phone className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">店舗情報編集</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗の基本情報、営業時間、連絡先を編集できます
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">店舗情報編集</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗の基本情報、営業時間、連絡先を編集できます
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || '店舗情報が見つかりません'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* ページタイトル */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">店舗情報編集</h1>
        <p className="mt-1 text-sm text-gray-600">
          店舗の基本情報、営業時間、連絡先を編集できます
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 基本情報タブ */}
      {activeTab === 'basic' && (
        <BasicInfoTab
          formData={formData}
          onFormChange={updateFormData}
          onImageChange={(dataUrl) => updateFormData({ image_url: dataUrl })}
          isSaving={isSaving}
          onSave={save}
          isActive={shop?.is_active}
        />
      )}

      {/* 営業時間タブ */}
      {activeTab === 'hours' && (
        <BusinessHoursTab
          formData={formData}
          onBusinessHoursChange={updateBusinessHours}
          isSaving={isSaving}
          onSave={save}
        />
      )}

      {/* 連絡先タブ */}
      {activeTab === 'contact' && (
        <ContactTab
          formData={formData}
          onFormChange={updateFormData}
          isSaving={isSaving}
          onSave={save}
        />
      )}
    </div>
  );
};
