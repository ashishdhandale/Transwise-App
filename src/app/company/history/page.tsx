
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { HistoryTracking } from '@/components/company/history/history-tracking';


function HistoryPage() {
  return (
    <DashboardLayout>
      <HistoryTracking />
    </DashboardLayout>
  );
}

export default function HistoryRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryPage />
    </Suspense>
  );
}
