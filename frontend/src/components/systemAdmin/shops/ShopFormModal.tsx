/**
 * 店舗フォームモーダルコンポーネント
 * 店舗の作成・編集フォーム
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ShopFormFields } from './ShopFormFields';
import { ShopManagerSection } from './ShopManagerSection';

interface ShopFormModalProps {
  /** モーダルが開いているか */
  isOpen: boolean;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
  /** フォーム送信時のコールバック */
  onSubmit: (formData: any, newManagerData: any, managerMode: string) => Promise<void>;
  /** 編集対象の店舗（nullの場合は新規作成） */
  editingShop?: any | null;
  /** 利用可能なマネージャーリスト */
  shopManagers: any[];
}

/**
 * 店舗フォームモーダルコンポーネント
 *
 * @example
 * ```tsx
 * <ShopFormModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onSubmit={handleSubmit}
 *   editingShop={editingShop}
 *   shopManagers={shopManagers}
 * />
 * ```
 */
export const ShopFormModal: React.FC<ShopFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingShop = null,
  shopManagers,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    postalCode: '',
    formattedAddress: '',
    placeId: '',
    phone: '',
    email: '',
    category: 'restaurant' as 'restaurant' | 'cafe' | 'izakaya',
    latitude: 0,
    longitude: 0,
    shop_manager_id: '',
    image_url: '',
    is_active: false,
    business_hours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '21:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '09:00', close: '21:00' },
    },
  });

  const [newManagerData, setNewManagerData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [managerMode, setManagerMode] = useState<'existing' | 'new'>('existing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編集対象が変わった時にフォームを初期化
  useEffect(() => {
    if (editingShop) {
      setFormData({
        name: editingShop.name || '',
        description: editingShop.description || '',
        address: editingShop.address || '',
        postalCode: editingShop.postal_code || '',
        formattedAddress: editingShop.formatted_address || '',
        placeId: editingShop.place_id || '',
        phone: editingShop.phone || '',
        email: editingShop.email || '',
        category: editingShop.category || 'restaurant',
        latitude: editingShop.latitude || 0,
        longitude: editingShop.longitude || 0,
        shop_manager_id: editingShop.shop_manager_id || '',
        image_url: editingShop.image_url || '',
        is_active: editingShop.is_active || false,
        business_hours: editingShop.business_hours || {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '21:00' },
          sunday: { open: '09:00', close: '21:00' },
        },
      });
      setManagerMode('existing');
    } else {
      // 新規作成時は初期値にリセット
      setFormData({
        name: '',
        description: '',
        address: '',
        postalCode: '',
        formattedAddress: '',
        placeId: '',
        phone: '',
        email: '',
        category: 'restaurant',
        latitude: 0,
        longitude: 0,
        shop_manager_id: '',
        image_url: '',
        is_active: false,
        business_hours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '21:00' },
          sunday: { open: '09:00', close: '21:00' },
        },
      });
      setManagerMode('existing');
    }
    setNewManagerData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
    setError(null);
  }, [editingShop, isOpen]);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewManagerChange = (field: string, value: string) => {
    setNewManagerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressSelect = (addressData: any) => {
    setFormData((prev) => ({
      ...prev,
      address: addressData.fullAddress,
    }));
    // 住所が補完されたら自動的にGeocoding実行
    handleGeocodeAddress(addressData.fullAddress);
  };

  const handleGeocodeAddress = async (addressOverride?: string) => {
    const targetAddress = addressOverride || formData.address;

    if (!targetAddress) return;

    setIsGeocoding(true);
    setError(null);

    try {
      // バックエンド経由でGeocoding APIを呼び出し
      // TODO: apiService.geocode を使用
      // const response = await apiService.geocode(targetAddress);
      // setFormData(prev => ({
      //   ...prev,
      //   latitude: response.latitude,
      //   longitude: response.longitude,
      //   formattedAddress: response.formatted_address,
      //   placeId: response.place_id
      // }));
      console.log('Geocoding:', targetAddress);
    } catch (err: any) {
      console.error('Geocoding failed:', err);
      setError(err.message || '位置情報の取得に失敗しました');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData, newManagerData, managerMode);
    } catch (err) {
      console.error('Failed to submit form:', err);
      setError('保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white rounded-t-lg md:rounded-lg w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingShop ? '店舗編集' : '新規店舗作成'}
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">基本情報</h3>

              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  店舗名 *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="mt-1"
                  placeholder="店舗名を入力"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  カテゴリ *
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="restaurant">レストラン</option>
                  <option value="cafe">カフェ</option>
                  <option value="izakaya">居酒屋</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  説明
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="店舗の説明を入力"
                />
              </div>
            </div>

            {/* 住所・位置情報 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">住所・位置情報</h3>
              <ShopFormFields
                formData={formData}
                onChange={handleFormChange}
                onAddressSelect={handleAddressSelect}
                isGeocoding={isGeocoding}
                onGeocode={() => handleGeocodeAddress()}
              />
            </div>

            {/* マネージャー選択 */}
            <ShopManagerSection
              shopManagers={shopManagers}
              managerMode={managerMode}
              onManagerModeChange={setManagerMode}
              selectedManagerId={formData.shop_manager_id}
              onSelectedManagerIdChange={(id) => handleFormChange('shop_manager_id', id)}
              newManagerData={newManagerData}
              onNewManagerChange={handleNewManagerChange}
              isEditing={!!editingShop}
            />

            {/* ボタン */}
            <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
