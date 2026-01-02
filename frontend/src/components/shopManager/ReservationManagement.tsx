import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  partySize: number;
  arrivalTimeEstimate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Shop {
  id: string;
  name: string;
}

export const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchShopAndReservations();
  }, []);

  const fetchShopAndReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      // 店舗情報を取得
      const shopData = await apiService.getMyShop();
      setShop(shopData);

      if (shopData && shopData.id) {
        // 予約機能が有効かチェック
        try {
          const featuresResponse = await apiService.getShopFeatures(shopData.id);
          if (featuresResponse.features.reservation !== true) {
            setError('この店舗では予約機能をご利用いただけません');
            setLoading(false);
            return;
          }
        } catch (featureError) {
          console.error('Failed to check reservation feature:', featureError);
          setError('予約機能の確認に失敗しました');
          setLoading(false);
          return;
        }

        // 予約一覧を取得
        const reservationData = await apiService.getShopReservations(shopData.id);
        setReservations(reservationData.reservations || []);
      }
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError('予約情報の取得に失敗しました');
      toast({
        title: 'エラー',
        description: '予約情報の取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservationId: string) => {
    if (processingId) return;

    try {
      setProcessingId(reservationId);
      await apiService.approveReservation(reservationId);
      toast({
        title: '予約を承認しました',
        description: '予約が承認されました',
      });
      await fetchShopAndReservations();
    } catch (err) {
      console.error('Failed to approve reservation:', err);
      toast({
        title: 'エラー',
        description: '予約の承認に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedReservationId || processingId) return;

    try {
      setProcessingId(selectedReservationId);
      await apiService.rejectReservation(selectedReservationId, rejectionReason || undefined);
      toast({
        title: '予約をお断りしました',
        description: '予約をお断りしました',
      });
      setRejectDialogOpen(false);
      setSelectedReservationId(null);
      setRejectionReason('');
      await fetchShopAndReservations();
    } catch (err) {
      console.error('Failed to reject reservation:', err);
      toast({
        title: 'エラー',
        description: '予約のお断りに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">承認待ち</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">承認済み</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">お断り</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">キャンセル</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            ご予約の確認と承認を行います
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            ご予約の確認と承認を行います
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || '店舗情報が見つかりません'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
        <p className="mt-1 text-sm text-gray-600">
          {shop.name}のご予約の確認と承認を行います
        </p>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">予約はありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.userName}様
                    </h3>
                    <p className="text-sm text-gray-600">
                      {reservation.userEmail}
                    </p>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">人数:</span>
                      <span className="ml-2 text-gray-900">
                        {reservation.partySize}名
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">到着予定:</span>
                      <span className="ml-2 text-gray-900">
                        {getArrivalTimeText(reservation.arrivalTimeEstimate)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">予約日時:</span>
                      <span className="ml-2 text-gray-900">
                        {formatDate(reservation.createdAt)}
                      </span>
                    </div>
                  </div>

                  {reservation.status === 'rejected' && reservation.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-800 mb-1">お断り理由</p>
                      <p className="text-sm text-red-700">{reservation.rejectionReason}</p>
                    </div>
                  )}

                  {reservation.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleApprove(reservation.id)}
                        disabled={processingId === reservation.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        ✓ 承認
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(reservation.id)}
                        disabled={processingId === reservation.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        ✕ お断り
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* お断り理由入力ダイアログ */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>予約をお断り</DialogTitle>
            <DialogDescription>
              予約をお断りする理由を入力してください（任意）。この理由は利用者に表示されます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">お断り理由</Label>
              <Input
                id="rejection-reason"
                placeholder="例：満席のため、営業時間外のため など"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setSelectedReservationId(null);
                setRejectionReason('');
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processingId !== null}
            >
              {processingId ? '処理中...' : 'お断りする'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

