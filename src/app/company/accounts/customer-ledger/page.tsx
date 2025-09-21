
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { AccountsDashboard } from '@/components/company/accounts/accounts-dashboard';


function CustomerLedgerPage() {
  return (
    <DashboardLayout>
      <AccountsDashboard />
    </DashboardLayout>
  );
}

export default function CustomerLedgerRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerLedgerPage />
    </Suspense>
  );
}
