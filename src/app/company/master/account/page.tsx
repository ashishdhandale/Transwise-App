
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { AccountManagement } from '@/components/company/master/account-management';
import { Wallet } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';


function AccountMasterPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <Wallet className="h-8 w-8" />
                Account Master
            </h1>
        </header>
        <AccountManagement />
    </main>
  );
}

export default function AccountMasterRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <AccountMasterPage />
      </DashboardLayout>
    </Suspense>
  );
}
