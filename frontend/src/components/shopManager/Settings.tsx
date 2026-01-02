import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { PushNotificationSettings } from './PushNotificationSettings';
import { FeatureStatus } from './FeatureStatus';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { QrCode } from 'lucide-react';

interface StaffAccessInfo {
  staff_access_token: string;
  staff_passcode: string;
  staff_token_created_at: string;
}

export const Settings: React.FC = () => {
  const { toast } = useToast();
  const [shopId, setShopId] = useState<string | null>(null);
  const [staffAccessInfo, setStaffAccessInfo] = useState<StaffAccessInfo | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const fetchShopId = async () => {
      try {
        const shopData = await apiService.getMyShop();
        setShopId(shopData.id);
        
        // スタッフ用アクセス情報を取得
        try {
          const staffData = await apiService.getStaffAccessInfo(shopData.id);
          setStaffAccessInfo(staffData);
        } catch (err) {
          console.error('Failed to fetch staff access info:', err);
          // スタッフ情報の取得失敗はエラーとしない
        }
      } catch (error) {
        console.error('Failed to fetch shop:', error);
      }
    };
    fetchShopId();
  }, []);

  const handleRegenerateToken = async () => {
    if (!shopId) return;
    
    setIsRegenerating(true);
    
    try {
      const newInfo = await apiService.updateStaffAccessInfo(shopId, true, false);
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
    if (!shopId) return;
    
    setIsRegenerating(true);
    
    try {
      const newInfo = await apiService.updateStaffAccessInfo(shopId, false, true);
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 md:pb-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">設定</h1>
      
      <div className="space-y-4 sm:space-y-6">
        {/* スタッフ用QRコード管理カード */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">スタッフ用QRコード</h2>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-sm text-gray-600">
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
              </div>

              {/* 合言葉とURL表示 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">合言葉</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 font-mono text-base sm:text-lg tracking-widest text-center">
                      {staffAccessInfo?.staff_passcode || '読み込み中...'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRegeneratePasscode}
                      disabled={isRegenerating}
                      className="whitespace-nowrap"
                    >
                      {isRegenerating ? '再生成中...' : '再生成'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">スタッフ用URL</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs sm:text-sm font-mono truncate">
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
                      className="whitespace-nowrap"
                    >
                      コピー
                    </Button>
                  </div>
                </div>
              </div>

              {/* 管理ボタン */}
              <div className="flex justify-center">
                <Button 
                  variant="outline"
                  onClick={handleRegenerateToken}
                  disabled={isRegenerating}
                  className="w-full sm:w-auto"
                >
                  {isRegenerating ? '再発行中...' : 'QRコード再発行'}
                </Button>
              </div>

              {/* 説明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">使用方法</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• スタッフはQRコードを読み取ってアクセスします</li>
                  <li>• 合言葉を入力すると空き状況を更新できます</li>
                  <li>• セキュリティのため、定期的に合言葉を再生成してください</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {shopId && <FeatureStatus shopId={shopId} />}
        <PushNotificationSettings />
      </div>
    </div>
  );
};

