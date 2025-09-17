
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { StockDashboard } from '@/components/company/stock/stock-dashboard';


function StockPage() {
  return (
    <DashboardLayout>
      <StockDashboard />
    </DashboardLayout>
  );
}

export default function StockRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockPage />
    </Suspense>
  );
}
