/**
 * 店舗情報管理カスタムフック
 * 店舗情報の取得、フォーム状態、保存機能を管理
 */

import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { useToast } from '../../../hooks/use-toast';

/**
 * 店舗フォームデータ
 */
export interface ShopFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  category: 'izakaya' | 'cafe' | 'restaurant';
  business_hours: {
    [key: string]: {
      open: string;
      close: string;
      close_next_day?: boolean;
      is_closed?: boolean;
    };
  };
  image_url: string;
  is_active: boolean;
}

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  business_hours: any;
  image_url: string;
  is_active?: boolean;
}

/**
 * useShopInfo の戻り値
 */
export interface UseShopInfoReturn {
  shop: Shop | null;
  formData: ShopFormData;
  loading: boolean;
  error: string | null;
  isSaving: boolean;
  updateFormData: (updates: Partial<ShopFormData>) => void;
  updateBusinessHours: (day: string, field: string, value: string | boolean) => void;
  updateImage: (dataUrl: string) => void;
  save: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * 店舗情報管理フック
 *
 * @returns 店舗情報管理機能
 *
 * @example
 * ```tsx
 * const { shop, formData, updateFormData, save } = useShopInfo();
 * ```
 */
export function useShopInfo(): UseShopInfoReturn {
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    category: 'izakaya',
    business_hours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' },
    },
    image_url: '',
    is_active: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * 店舗情報を取得
   */
  const fetchShop = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const shopData = await apiService.getMyShop();
      setShop(shopData);
      setFormData({
        name: shopData.name,
        description: shopData.description || '',
        address: shopData.address,
        phone: shopData.phone || '',
        email: shopData.email || '',
        category: shopData.category || 'izakaya',
        business_hours: shopData.business_hours || {
          monday: { open: '', close: '' },
          tuesday: { open: '', close: '' },
          wednesday: { open: '', close: '' },
          thursday: { open: '', close: '' },
          friday: { open: '', close: '' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' },
        },
        image_url: shopData.image_url || '',
        is_active: shopData.is_active || false,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '店舗情報の取得に失敗しました';
      setError(errorMsg);
      console.error('Failed to fetch shop:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * フォームデータを更新
   */
  const updateFormData = useCallback((updates: Partial<ShopFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * 営業時間を更新
   */
  const updateBusinessHours = useCallback(
    (day: string, field: string, value: string | boolean) => {
      setFormData((prev) => ({
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
  const updateImage = useCallback((dataUrl: string) => {
    setFormData((prev) => ({ ...prev, image_url: dataUrl }));
  }, []);

  /**
   * 店舗情報を保存
   */
  const save = useCallback(async () => {
    if (!shop) return;

    setIsSaving(true);

    try {
      await apiService.updateShop(shop.id, formData);

      // 保存後に最新の店舗情報を再取得
      const updatedShopData = await apiService.getMyShop();
      setShop(updatedShopData);
      setFormData({
        name: updatedShopData.name,
        description: updatedShopData.description || '',
        address: updatedShopData.address,
        phone: updatedShopData.phone || '',
        email: updatedShopData.email || '',
        category: updatedShopData.category || 'izakaya',
        business_hours: updatedShopData.business_hours || {},
        image_url: updatedShopData.image_url || '',
        is_active: updatedShopData.is_active || false,
      });

      toast({
        title: '保存完了',
        description: '店舗情報を保存しました！',
        variant: 'success',
      });
    } catch (err: any) {
      const errorMsg = err?.message || '保存に失敗しました。もう一度お試しください。';
      console.error('Save error:', err);

      toast({
        title: '保存失敗',
        description: errorMsg,
        variant: 'destructive',
      });

      // エラーが発生した場合は店舗情報を再取得して状態をリセット
      try {
        const updatedShopData = await apiService.getMyShop();
        setShop(updatedShopData);
        setFormData({
          name: updatedShopData.name,
          description: updatedShopData.description || '',
          address: updatedShopData.address,
          phone: updatedShopData.phone || '',
          email: updatedShopData.email || '',
          category: updatedShopData.category || 'izakaya',
          business_hours: updatedShopData.business_hours || {},
          image_url: updatedShopData.image_url || '',
          is_active: updatedShopData.is_active || false,
        });
      } catch (refreshError) {
        console.error('Failed to refresh shop data:', refreshError);
      }
    } finally {
      setIsSaving(false);
    }
  }, [shop, formData, toast]);

  // 初回ロード時に店舗情報を取得
  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  return {
    shop,
    formData,
    loading,
    error,
    isSaving,
    updateFormData,
    updateBusinessHours,
    updateImage,
    save,
    refetch: fetchShop,
  };
}
