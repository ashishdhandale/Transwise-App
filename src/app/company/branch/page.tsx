
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { BranchDashboard } from '@/components/company/branch/branch-dashboard';
import { ClientOnly } from '@/components/ui/client-only';

function BranchPage() {
  return (
    <DashboardLayout>
        <main className="flex-1 p-4 md:p-6">
          <ClientOnly>
            <BranchDashboard />
          </ClientOnly>
        </main>
    </DashboardLayout>
  );
}

export default function BranchRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BranchPage />
    </Suspense>
  );
}

    