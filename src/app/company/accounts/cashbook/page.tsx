
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { Cashbook } from '@/components/company/accounts/cashbook';


function CashbookPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <Cashbook />
      </main>
    </DashboardLayout>
  );
}

export default function CashbookRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CashbookPage />
    </Suspense>
  );
}
