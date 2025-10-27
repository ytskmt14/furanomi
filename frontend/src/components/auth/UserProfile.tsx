import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: 'ログアウト完了',
        description: 'ログアウトしました',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ログアウトに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">マイプロフィール</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            メールアドレス
          </label>
          <p className="text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            名前
          </label>
          <p className="text-gray-900">{user.name}</p>
        </div>

        {user.phone && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              電話番号
            </label>
            <p className="text-gray-900">{user.phone}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="destructive"
            className="w-full"
          >
            {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
          </Button>
        </div>
      </div>
    </div>
  );
};
