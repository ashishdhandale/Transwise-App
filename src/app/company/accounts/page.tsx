
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { AccountsDashboard } from '@/components/company/accounts/accounts-dashboard';


function AccountsPage() {
  return (
    <DashboardLayout>
      <AccountsDashboard />
    </DashboardLayout>
  );
}

export default function AccountsRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountsPage />
    </Suspense>
  );
}
