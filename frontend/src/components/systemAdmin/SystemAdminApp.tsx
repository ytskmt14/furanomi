import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SystemAdminLogin } from './SystemAdminLogin';
import { SystemAdminLayout } from './SystemAdminLayout';
import { SystemAdminDashboard } from './SystemAdminDashboard';
import { ShopsManagement } from './ShopsManagement';
import { ManagersManagement } from './ManagersManagement';
import { SystemSettings } from './SystemSettings';

export const SystemAdminApp: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<SystemAdminLogin />} />
      <Route path="/*" element={
        <SystemAdminLayout>
          <Routes>
            <Route index element={<SystemAdminDashboard />} />
            <Route path="shops" element={<ShopsManagement />} />
            <Route path="managers" element={<ManagersManagement />} />
            <Route path="settings" element={<SystemSettings />} />
          </Routes>
        </SystemAdminLayout>
      } />
    </Routes>
  );
};
