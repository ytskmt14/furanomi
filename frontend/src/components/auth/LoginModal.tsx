import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'ログイン成功',
        description: 'ログインしました',
      });
      onClose();
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: 'ログイン失敗',
        description: error.message || 'ログインに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4 sm:mb-5 p-4 sm:p-6 pb-0">
          <h2 className="text-lg sm:text-xl font-bold">ログイン</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <span className="text-xl sm:text-2xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-4 sm:p-6 pt-0">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5 sm:mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5 sm:mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 sm:h-10 text-base sm:text-sm font-medium touch-manipulation"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-11 sm:h-10 px-4 sm:px-6 text-base sm:text-sm font-medium touch-manipulation"
            >
              キャンセル
            </Button>
          </div>

          {onSwitchToRegister && (
            <div className="mt-4 sm:mt-5 text-center px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-xs sm:text-sm text-gray-600">
                アカウントをお持ちでない方は{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  className="text-blue-600 hover:text-blue-700 underline touch-manipulation min-h-[44px] inline-flex items-center"
                >
                  新規登録
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
