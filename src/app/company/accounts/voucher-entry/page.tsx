
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { VoucherEntry } from '@/components/company/accounts/voucher-entry';


function VoucherEntryPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <VoucherEntry />
      </main>
    </DashboardLayout>
  );
}

export default function VoucherEntryRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoucherEntryPage />
    </Suspense>
  );
}
