import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface Reservation {
  id: string;
  shopId: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  partySize: number;
  arrivalTimeEstimate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMyReservations();
      setReservations(response.reservations);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast({
        title: 'エラー',
        description: '予約の読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (reservationId: string, shopName: string) => {
    if (!confirm(`${shopName}への予約をキャンセルしますか？`)) {
      return;
    }

    try {
      await apiService.cancelReservation(reservationId);
      toast({
        title: 'キャンセル完了',
        description: '予約をキャンセルしました',
      });
      loadReservations();
    } catch (error: any) {
      toast({
        title: 'キャンセル失敗',
        description: error.message || '予約のキャンセルに失敗しました',
        variant: 'destructive',
      });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '拒否';
      case 'cancelled':
        return 'キャンセル済み';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getArrivalTimeText = (estimate: string) => {
    switch (estimate) {
      case '15min':
        return '15分以内';
      case '30min':
        return '30分以内';
      case '1hour':
        return '1時間以内';
      default:
        return estimate;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">マイ予約</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">マイ予約</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">予約はまだありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{reservation.shopName}</h3>
                  <p className="text-sm text-gray-600">{reservation.shopAddress}</p>
                  {reservation.shopPhone && (
                    <p className="text-sm text-gray-600">📞 {reservation.shopPhone}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">人数:</span>
                  <span className="ml-2 font-medium">{reservation.partySize}人</span>
                </div>
                <div>
                  <span className="text-gray-600">到着予定:</span>
                  <span className="ml-2 font-medium">{getArrivalTimeText(reservation.arrivalTimeEstimate)}</span>
                </div>
                <div>
                  <span className="text-gray-600">予約日時:</span>
                  <span className="ml-2 font-medium">
                    {new Date(reservation.createdAt).toLocaleString('ja-JP')}
                  </span>
                </div>
              </div>

              {reservation.status !== 'cancelled' && reservation.status !== 'rejected' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancel(reservation.id, reservation.shopName)}
                  className="w-full sm:w-auto"
                >
                  キャンセル
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
