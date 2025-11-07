import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';

interface Shop {
  id: string;
  name: string;
  availability_status?: string;
  availability_updated_at?: string;
}

interface StaffAccessInfo {
  staff_access_token: string;
  staff_passcode: string;
  staff_token_created_at: string;
}

export const AvailabilityUpdate: React.FC = () => {
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('closed');
  const [isUpdating, setIsUpdating] = useState(false);
  const [staffAccessInfo, setStaffAccessInfo] = useState<StaffAccessInfo | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 店舗情報とスタッフ用アクセス情報を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopData, staffData] = await Promise.all([
          apiService.getMyShop(),
          apiService.getStaffAccessInfo(shop?.id || '')
        ]);
        setShop(shopData);
        setSelectedStatus(shopData.availability_status || 'closed');
        setStaffAccessInfo(staffData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (shop?.id) {
      fetchData();
    } else {
      // 最初に店舗情報のみ取得
      const fetchShop = async () => {
        try {
          const shopData = await apiService.getMyShop();
          setShop(shopData);
          setSelectedStatus(shopData.availability_status || 'closed');
          
          // 店舗情報取得後、スタッフ用アクセス情報を取得
          const staffData = await apiService.getStaffAccessInfo(shopData.id);
          setStaffAccessInfo(staffData);
        } catch (err) {
          console.error('Failed to fetch shop:', err);
          setError('店舗情報の取得に失敗しました');
        } finally {
          setLoading(false);
        }
      };

      fetchShop();
    }
  }, [shop?.id]);

  const availabilityOptions = [
    { value: 'available', label: '空きあり', icon: '🟢', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'busy', label: '混雑', icon: '🟡', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'full', label: '満席', icon: '🔴', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'closed', label: '営業時間外', icon: '⚫', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  ];

  const handleStatusUpdate = async () => {
    if (!shop) return;
    
    setIsUpdating(true);
    
    try {
      await apiService.updateAvailability(shop.id, selectedStatus);
      toast({
        title: "更新完了",
        description: "空き状況を更新しました！",
        variant: "success",
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "更新失敗",
        description: "更新に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!shop) return;
    
    setIsRegenerating(true);
    
    try {
      const newInfo = await apiService.updateStaffAccessInfo(shop.id, true, false);
      setStaffAccessInfo(newInfo);
      toast({
        title: "再発行完了",
        description: "QRコードを再発行しました！",
        variant: "success",
      });
    } catch (error) {
      console.error('Regenerate error:', error);
      toast({
        title: "再発行失敗",
        description: "再発行に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegeneratePasscode = async () => {
    if (!shop) return;
    
    setIsRegenerating(true);
    
    try {
      const newInfo = await apiService.updateStaffAccessInfo(shop.id, false, true);
      setStaffAccessInfo(newInfo);
      toast({
        title: "再生成完了",
        description: "合言葉を再生成しました！",
        variant: "success",
      });
    } catch (error) {
      console.error('Regenerate error:', error);
      toast({
        title: "再生成失敗",
        description: "再生成に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">空き状況更新</h1>
          <p className="mt-1 text-sm text-gray-600">
            現在の混雑状況を更新して、お客様に正確な情報を提供しましょう
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
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">空き状況更新</h1>
          <p className="mt-1 text-sm text-gray-600">
            現在の混雑状況を更新して、お客様に正確な情報を提供しましょう
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || '店舗情報が見つかりません'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ページタイトル */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">空き状況更新</h1>
        <p className="mt-1 text-sm text-gray-600">
          現在の混雑状況を更新して、お客様に正確な情報を提供しましょう
        </p>
      </div>


      {/* 空き状況選択 */}
      <Card className="shadow-sm">
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">空き状況を選択</h3>
            <p className="text-sm text-gray-600">
              現在の混雑状況に最も近いものを選択してください
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availabilityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value as any)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === option.value
                    ? `${option.color} border-current`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="text-left">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-gray-600">
                      {option.value === 'available' && '席に余裕があります'}
                      {option.value === 'busy' && '混雑していますが入店可能です'}
                      {option.value === 'full' && '満席です'}
                      {option.value === 'closed' && '営業時間外です'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 更新ボタン */}
          <div className="flex justify-center pt-6 border-t border-gray-200 mt-6">
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  更新中...
                </div>
              ) : (
                '空き状況を更新'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* スタッフ用QRコード管理 */}
      <Card className="shadow-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">スタッフ用QRコード</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600 -mt-4 mb-4">
            スタッフが空き状況を更新するためのQRコードと合言葉を管理します
          </p>
          {/* QRコード表示 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <QRCodeSVG 
                value={`${window.location.origin}/staff/availability?token=${staffAccessInfo?.staff_access_token || 'loading'}`} 
                size={200}
                level="M"
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              このQRコードをスタッフに配布してください
            </p>
          </div>

          {/* 合言葉とURL表示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">合言葉</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 font-mono text-lg tracking-widest">
                  {staffAccessInfo?.staff_passcode || '読み込み中...'}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRegeneratePasscode}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? '再生成中...' : '再生成'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">スタッフ用URL</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm font-mono truncate">
                  {`${window.location.origin}/staff/availability?token=${staffAccessInfo?.staff_access_token || 'loading'}`}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/staff/availability?token=${staffAccessInfo?.staff_access_token || ''}`);
                    toast({
                      description: "URLをコピーしました",
                      variant: "success",
                    });
                  }}
                >
                  コピー
                </Button>
              </div>
            </div>
          </div>

          {/* 管理ボタン */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline"
              onClick={handleRegenerateToken}
              disabled={isRegenerating}
            >
              {isRegenerating ? '再発行中...' : 'QRコード再発行'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // モック印刷
                window.print();
              }}
            >
              印刷
            </Button>
          </div>

          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">使用方法</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• QRコードを印刷してスタッフに配布してください</li>
              <li>• スタッフはQRコードを読み取ってアクセスします</li>
              <li>• 合言葉を入力すると空き状況を更新できます</li>
              <li>• セキュリティのため、定期的に合言葉を再生成してください</li>
            </ul>
          </div>

          {/* セキュリティに関する説明 */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">🔒 セキュリティ機能</h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• スタッフがURLにアクセスするとトークンはセッションメモリに移動します</li>
              <li>• ブラウザを閉じるとセッションは自動的に削除されます</li>
              <li>• URLはブラウザ履歴やサーバーログには保存されません（セッション後）</li>
              <li>• スタッフ認証後は合言葉入力でのみ操作可能です</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
