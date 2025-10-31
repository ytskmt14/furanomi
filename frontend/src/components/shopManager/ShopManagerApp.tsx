import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorHandling';
import { ShopManagerLayout } from './ShopManagerLayout';
import { ShopManagerLogin } from './ShopManagerLogin';
import { ShopManagerDashboard } from './ShopManagerDashboard';
import { ShopInfoEdit } from './ShopInfoEdit';
import { AvailabilityUpdate } from './AvailabilityUpdate';
import { ReservationManagement } from './ReservationManagement';
import { Settings } from './Settings';

const ShopManagerApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ログイン画面 */}
        <Route path="/login" element={<ShopManagerLogin />} />
        
        {/* 管理画面（レイアウト付き） */}
        <Route path="/" element={<ShopManagerLayout><Outlet /></ShopManagerLayout>}>
          <Route index element={<ShopManagerDashboard />} />
          <Route path="shop" element={<ShopInfoEdit />} />
          <Route path="availability" element={<AvailabilityUpdate />} />
          <Route path="reservations" element={<ReservationManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* デフォルトリダイレクト */}
        <Route path="*" element={<Navigate to="/shop-manager/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default ShopManagerApp;
