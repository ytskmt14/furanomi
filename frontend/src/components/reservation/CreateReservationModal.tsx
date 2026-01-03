import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Users, Clock, CalendarDays, X, Store } from 'lucide-react';

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
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      if (error.message && error.message.includes('Authentication')) {
        toast({
          title: 'ログインが必要',
          description: '予約にはログインが必要です',
          variant: 'destructive',
        });
        onClose();
        return;
      }
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
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl px-6 py-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold">予約</h2>
          </div>
          <div className="flex items-center gap-2 text-blue-50">
            <Store className="w-4 h-4" />
            <p className="text-sm font-medium">{shopName}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 人数選択 */}
          <div className="space-y-2">
            <Label htmlFor="party-size" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              人数
            </Label>
            <Select
              value={partySize.toString()}
              onValueChange={(value) => setPartySize(parseInt(value))}
              disabled={isLoading}
              required
            >
              <SelectTrigger id="party-size" className="w-full h-11 text-base">
                <SelectValue placeholder="人数を選択" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={num.toString()} className="text-base">
                    {num}人
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 到着予定時間選択 */}
          <div className="space-y-2">
            <Label htmlFor="arrival-time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              到着予定時間
            </Label>
            <Select
              value={arrivalTimeEstimate}
              onValueChange={(value) => setArrivalTimeEstimate(value)}
              disabled={isLoading}
              required
            >
              <SelectTrigger id="arrival-time" className="w-full h-11 text-base">
                <SelectValue placeholder="到着予定時間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15min" className="text-base">15分以内</SelectItem>
                <SelectItem value="30min" className="text-base">30分以内</SelectItem>
                <SelectItem value="1hour" className="text-base">1時間以内</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  予約中...
                </>
              ) : (
                <>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  予約する
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-11 px-6 text-base font-medium"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
