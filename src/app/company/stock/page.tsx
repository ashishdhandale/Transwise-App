
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { StockDashboard } from '@/components/company/stock/stock-dashboard';
import { ClientOnly } from '@/components/ui/client-only';


function StockPage() {
  return (
    <DashboardLayout>
      <ClientOnly>
        <StockDashboard />
      </ClientOnly>
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
