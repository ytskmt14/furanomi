import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'エラー',
        description: 'パスワードが一致しません',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'エラー',
        description: 'パスワードは6文字以上で入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name, phone || undefined);
      toast({
        title: '登録成功',
        description: 'アカウントが作成されました',
      });
      onClose();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setPhone('');
    } catch (error: any) {
      toast({
        title: '登録失敗',
        description: error.message || '登録に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4 sm:mb-5 p-4 sm:p-6 pb-0 sticky top-0 bg-white z-10 border-b">
          <h2 className="text-lg sm:text-xl font-bold">新規登録</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <span className="text-xl sm:text-2xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-4 sm:p-6 pt-4">
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium mb-1.5 sm:mb-2">
              メールアドレス
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="register-name" className="block text-sm font-medium mb-1.5 sm:mb-2">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="register-phone" className="block text-sm font-medium mb-1.5 sm:mb-2">
              電話番号（任意）
            </label>
            <input
              id="register-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium mb-1.5 sm:mb-2">
              パスワード <span className="text-xs text-gray-500">（6文字以上）</span>
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-medium mb-1.5 sm:mb-2">
              パスワード（確認）
            </label>
            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
              {isLoading ? '登録中...' : '登録'}
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
        </form>
      </div>
    </div>
  );
};
