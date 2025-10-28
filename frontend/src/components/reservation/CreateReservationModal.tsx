import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopName: string;
}

export const CreateReservationModal: React.FC<CreateReservationModalProps> = ({
  isOpen,
  onClose,
  shopId,
  shopName
}) => {
  const [partySize, setPartySize] = useState(1);
  const [arrivalTimeEstimate, setArrivalTimeEstimate] = useState<string>('15min');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'ログインが必要',
        description: '予約にはログインが必要です',
        variant: 'destructive',
      });
      onClose();
      return;
    }

    setIsLoading(true);

    try {
      await apiService.createReservation(shopId, partySize, arrivalTimeEstimate);
      toast({
        title: '予約完了',
        description: `${shopName}への予約が完了しました`,
      });
      onClose();
      setPartySize(1);
      setArrivalTimeEstimate('15min');
    } catch (error: any) {
      toast({
        title: '予約失敗',
        description: error.message || '予約に失敗しました',
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
          <h2 className="text-xl font-bold">予約</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {shopName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="party-size" className="block text-sm font-medium mb-1">
              人数
            </label>
            <select
              id="party-size"
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}人</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="arrival-time" className="block text-sm font-medium mb-1">
              何分後
            </label>
            <select
              id="arrival-time"
              value={arrivalTimeEstimate}
              onChange={(e) => setArrivalTimeEstimate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="15min">15分以内</option>
              <option value="30min">30分以内</option>
              <option value="1hour">1時間以内</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '予約中...' : '予約する'}
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
