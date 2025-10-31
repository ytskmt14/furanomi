import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FileUpload } from '../ui/file-upload';
import { ShopFormData, BusinessHours } from '../../types/shopManager';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Store, Clock, Phone, Wine, Coffee, Utensils, ChevronDown } from 'lucide-react';
import { Switch } from '../ui/switch';

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

export const ShopInfoEdit: React.FC = () => {
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
      sunday: { open: '', close: '' }
    },
    image_url: '',
    is_active: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'hours' | 'contact'>('basic');

  // 店舗情報を取得
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const shopData = await apiService.getMyShop();
        setShop(shopData);
        setFormData({
          name: shopData.name,
          description: shopData.description || '',
          address: shopData.address,
          phone: shopData.phone || '',
          email: shopData.email || '',
          category: shopData.category,
          business_hours: shopData.business_hours || {},
          image_url: shopData.image_url || '',
          is_active: shopData.is_active || false,
        });
      } catch (err) {
        console.error('Failed to fetch shop:', err);
        setError('店舗情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      // 画像を圧縮してからBase64エンコード
      // 最大800x600ピクセルにリサイズし、JPEG品質80%で圧縮してBase64エンコード後のサイズを削減
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 最大サイズを設定（800x600）
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        // アスペクト比を保持しながらリサイズ
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 画像を描画
        ctx?.drawImage(img, 0, 0, width, height);
        
        // JPEG形式で圧縮（品質80%）
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, image_url: compressedDataUrl }));
      };
      
      img.src = URL.createObjectURL(file);
    }
  };

  const handleBusinessHoursChange = (day: keyof BusinessHours, field: 'open' | 'close' | 'close_next_day', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day as keyof typeof prev.business_hours],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
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
        category: updatedShopData.category,
        business_hours: updatedShopData.business_hours || {},
        image_url: updatedShopData.image_url || '',
        is_active: updatedShopData.is_active || false,
      });
      
      toast({
        title: "保存完了",
        description: "店舗情報を保存しました！",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.message || '保存に失敗しました。もう一度お試しください。';
      
      toast({
        title: "保存失敗",
        description: errorMessage,
        variant: "destructive",
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
          category: updatedShopData.category,
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
  };

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
        <Card className="shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">基本情報</h3>
            <p className="text-sm text-gray-600">店舗名、説明、カテゴリなどの基本情報</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                店舗名 *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="店舗名を入力"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                店舗説明
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="店舗の説明を入力"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                住所 *
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="住所を入力"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                カテゴリ *
              </Label>
              <div className="mt-1 relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="izakaya">居酒屋</option>
                  <option value="cafe">カフェ</option>
                  <option value="restaurant">レストラン</option>
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {formData.category === 'izakaya' && <Wine className="w-4 h-4 text-gray-500" />}
                  {formData.category === 'cafe' && <Coffee className="w-4 h-4 text-gray-500" />}
                  {formData.category === 'restaurant' && <Utensils className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                店舗画像
              </Label>
              <div className="mt-1">
                <FileUpload
                  onFileSelect={handleImageChange}
                  preview={formData.image_url}
                  maxSize={5 * 1024 * 1024} // 5MB
                  acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between py-4 border-t border-gray-200">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    利用者アプリへの公開
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    {shop?.is_active 
                      ? '一度公開した店舗は非公開に変更できません。システム管理者にお問い合わせください。'
                      : '必要な情報を設定したら、こちらを有効にすることで利用者アプリに公開されます。'}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, is_active: checked }));
                  }}
                  disabled={shop?.is_active === true}
                />
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="flex justify-end pt-6 pb-6 border-t border-gray-200">
              <Button
                onClick={handleSave}
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
      )}

      {/* 営業時間タブ */}
      {activeTab === 'hours' && (
        <Card className="shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">営業時間</h3>
            <p className="text-sm text-gray-600">曜日別の営業時間を設定</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const hours = formData.business_hours[day as keyof typeof formData.business_hours] || { open: '', close: '' };
                return (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      {day === 'monday' && '月曜日'}
                      {day === 'tuesday' && '火曜日'}
                      {day === 'wednesday' && '水曜日'}
                      {day === 'thursday' && '木曜日'}
                      {day === 'friday' && '金曜日'}
                      {day === 'saturday' && '土曜日'}
                      {day === 'sunday' && '日曜日'}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBusinessHoursChange(day as keyof BusinessHours, 'open', e.target.value)}
                        className="w-24"
                      />
                      <span className="text-gray-500">〜</span>
                      <div className="flex items-center space-x-1">
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBusinessHoursChange(day as keyof BusinessHours, 'close', e.target.value)}
                          className="w-24"
                        />
                        <select
                          value={hours.close_next_day ? 'next' : 'same'}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleBusinessHoursChange(day as keyof BusinessHours, 'close_next_day', e.target.value === 'next')}
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
                onClick={handleSave}
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
      )}

      {/* 連絡先タブ */}
      {activeTab === 'contact' && (
        <Card className="shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">連絡先情報</h3>
            <p className="text-sm text-gray-600">電話番号、メールアドレスなどの連絡先</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                電話番号
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="03-1234-5678"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="info@example.com"
              />
            </div>

            {/* 保存ボタン */}
            <div className="flex justify-end pt-6 pb-6 border-t border-gray-200">
              <Button
                onClick={handleSave}
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
      )}

    </div>
  );
};
