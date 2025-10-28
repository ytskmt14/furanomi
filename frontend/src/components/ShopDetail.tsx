import React, { useState } from 'react';
import { Shop } from '../types/shop';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { getAvailabilityText, getAvailabilityColorValue, getCategoryText, getCategoryIcon } from '../utils/helpers';
import { CreateReservationModal } from './reservation/CreateReservationModal';

interface ShopDetailProps {
  shop: Shop | null;
  onClose: () => void;
}

export const ShopDetail: React.FC<ShopDetailProps> = ({ shop, onClose }) => {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  
  console.log('ShopDetail rendered with shop:', shop);
  if (!shop) return null;

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return '🟢';
      case 'busy':
        return '🟡';
      case 'full':
        return '🔴';
      case 'closed':
        return '⚫';
      default:
        return '⚪';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {getCategoryIcon(shop.category)} {shop.name}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              className="text-white font-semibold px-4 py-2"
              style={{ backgroundColor: getAvailabilityColorValue(shop.availability_status) }}
            >
              {getAvailabilityIcon(shop.availability_status)} {getAvailabilityText(shop.availability_status)}
            </Badge>
            <Badge variant="secondary">
              {getCategoryText(shop.category)}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">📍 住所</h3>
              <p className="text-gray-600">{shop.address}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🕒 営業時間</h3>
              <div className="space-y-2">
                {(() => {
                  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const japaneseDayNames = ['日', '月', '火', '水', '木', '金', '土'];
                  
                  return dayNames.map((day, index) => {
                    const hours = shop.business_hours?.[day as keyof typeof shop.business_hours];
                    const displayDay = japaneseDayNames[index];
                    
                    return (
                      <div key={day} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{displayDay}曜日:</span>
                        <span className="text-sm text-gray-600">
                          {hours && hours.open && hours.close ? (
                            `${hours.open} - ${hours.close}${hours.close_next_day ? ' (翌日)' : ''}`
                          ) : (
                            <span className="text-gray-400">定休日</span>
                          )}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            
          </div>
          
          <div className="flex gap-3 pt-4">
            {shop.availability_status !== 'closed' && (
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => setIsReservationModalOpen(true)}
              >
                📅 予約する
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              🗺️ 地図で開く
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        shopId={shop.id}
        shopName={shop.name}
      />
    </div>
  );
};