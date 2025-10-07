
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { LicenceManagement } from '@/components/admin/licence-management';
import { BackButton } from '@/components/ui/back-button';
import { Award } from 'lucide-react';

function LicencePage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <div>
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-6 flex items-center gap-2">
                <Award className="h-8 w-8" />
                Licence Management
            </h1>
            <LicenceManagement />
        </div>
    </main>
  );
}

export default function LicenceRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <LicencePage />
      </DashboardLayout>
    </Suspense>
  );
}
