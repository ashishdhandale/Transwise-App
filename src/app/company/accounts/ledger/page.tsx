
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { AccountsDashboard } from '@/components/company/accounts/accounts-dashboard';


function LedgerPage() {
  return (
    <DashboardLayout>
      <AccountsDashboard />
    </DashboardLayout>
  );
}

export default function LedgerRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LedgerPage />
    </Suspense>
  );
}
