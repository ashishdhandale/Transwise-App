
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../../(dashboard)/layout';
import { NewQuotationForm } from '@/components/company/master/quotation/new-quotation-form';
import { FileSignature } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';


function NewQuotationPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <FileSignature className="h-8 w-8" />
                Create New Quotation
            </h1>
        </header>
        <NewQuotationForm />
    </main>
  );
}

export default function NewQuotationRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <NewQuotationPage />
      </DashboardLayout>
    </Suspense>
  );
}
