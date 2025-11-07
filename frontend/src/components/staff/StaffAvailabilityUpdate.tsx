import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { AVAILABILITY_OPTIONS } from '../../constants/availability';

const StaffAvailabilityUpdate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // トークンはURLから取得してセッションストレージに保存
  const urlToken = searchParams.get('token');
  const [token, setToken] = useState<string | null>(null);

  const { toast } = useToast();
  
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'available' | 'busy' | 'full' | 'closed'>('available');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName] = useState('');
  const [_shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 初期化: URLからトークンを取得してセッションストレージに保存
  useEffect(() => {
    if (urlToken) {
      // URLにトークンが含まれている場合、セッションストレージに保存
      sessionStorage.setItem('staffToken', urlToken);
      setToken(urlToken);
      // URLからクエリパラメータを削除（セキュリティ向上）
      navigate('/staff/availability', { replace: true });
    } else {
      // セッションストレージからトークンを復元
      const storedToken = sessionStorage.getItem('staffToken');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, [urlToken, navigate]);

  // 店舗情報を取得
  useEffect(() => {
    const fetchShop = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const shopData = await apiService.getShopByStaffToken(token);
        setShop(shopData);
        setShopName(shopData.name);
        setSelectedStatus(shopData.availability_status || 'available');
      } catch (err) {
        console.error('Failed to fetch shop:', err);
        setError('店舗情報の取得に失敗しました');
        // トークンが無効な場合、セッションをクリア
        sessionStorage.removeItem('staffToken');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [token]);

  // 認証処理
  const handleAuthentication = async () => {
    if (!token) {
      setError('アクセストークンが無効です');
      return;
    }

    if (passcode.length !== 4) {
      setError('合言葉は4桁の数字を入力してください');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await apiService.authenticateStaff(token, passcode);
      if (response.success) {
        setIsAuthenticated(true);
        setShopName(response.shop.name);
      } else {
        setError('認証に失敗しました');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('合言葉が正しくありません');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!token) return;

    setIsUpdating(true);
    setError(null);

    try {
      await apiService.updateAvailabilityByStaff(token, passcode, selectedStatus);
      toast({
        title: "更新完了",
        description: "空き状況を更新しました！",
        variant: "success",
      });
    } catch (err) {
      console.error('Update error:', err);
      setError('更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsUpdating(false);
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    sessionStorage.removeItem('staffToken');
    setToken(null);
    setIsAuthenticated(false);
    setPasscode('');
    setError(null);
    toast({
      title: "ログアウト",
      description: "セッションを終了しました。",
      variant: "success",
    });
  };

  // 可用性オプション
  const availabilityOptions = Object.values(AVAILABILITY_OPTIONS);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">読み込み中</h1>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">アクセスエラー</h1>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">
              アクセストークンが無効です。<br />
              店舗管理者にお問い合わせください。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* シンプルなヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900 text-center">スタッフ用空き状況更新</h1>
          </div>
        </header>

        {/* 認証フォーム */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">認証</h2>
              <p className="text-sm text-gray-600 mt-1">
                4桁の合言葉を入力してください
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passcode" className="text-sm font-medium text-gray-700">
                  合言葉
                </Label>
                <Input
                  id="passcode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={passcode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPasscode(value);
                  }}
                  className="mt-1 text-center text-2xl font-mono tracking-widest"
                  placeholder="1234"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                onClick={handleAuthentication}
                disabled={isUpdating || passcode.length !== 4}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    認証中...
                  </div>
                ) : (
                  '認証'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* シンプルなヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold text-gray-900">{shopName}</h1>
            <p className="text-sm text-gray-600 mt-1">スタッフ用空き状況更新</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="セッションを終了します"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* 空き状況更新フォーム */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">空き状況を選択</h2>
            <p className="text-sm text-gray-600 mt-1">
              現在の混雑状況に最も近いものを選択してください
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availabilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedStatus === option.value
                      ? `${option.badgeColor} ${option.textColor} ${option.borderColor} border-current`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{option.icon}</span>
                    <div className="text-left">
                      <p className="text-xl font-medium">{option.label}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-center">
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffAvailabilityUpdate;
