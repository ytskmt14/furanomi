import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.requestPasswordReset(email);
      toast({
        title: 'メール送信済み',
        description: 'パスワードリセットリンクが送信されました（開発中：コンソールを確認してください）',
      });
      onClose();
      setEmail('');
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message || 'パスワードリセットの要求に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">パスワードリセット</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium mb-1">
              メールアドレス
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              placeholder="登録済みのメールアドレスを入力"
            />
          </div>

          <p className="text-sm text-gray-600">
            入力されたメールアドレスにパスワードリセットリンクを送信します。
            <br />
            ※現在は開発中でメール送信機能は未実装です。コンソールを確認してください。
          </p>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '送信中...' : '送信'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
