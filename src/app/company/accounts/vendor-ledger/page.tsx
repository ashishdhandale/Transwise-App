
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { VendorLedgerDashboard } from '@/components/company/accounts/vendor-ledger-dashboard';


function VendorLedgerPage() {
  return (
    <DashboardLayout>
      <VendorLedgerDashboard />
    </DashboardLayout>
  );
}

export default function VendorLedgerRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorLedgerPage />
    </Suspense>
  );
}
