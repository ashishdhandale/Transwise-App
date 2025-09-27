
'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '../../../../../(dashboard)/layout';
import { QuotationForm } from '@/components/company/master/quotation/quotation-form';
import { FileSignature } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { Skeleton } from '@/components/ui/skeleton';

function EditQuotationPage() {
    const params = useParams();
    const id = params.id as string;

    if (!id) {
        return (
             <main className="flex-1 p-4 md:p-8">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-96 w-full" />
             </main>
        )
    }

    return (
        <main className="flex-1 p-4 md:p-8">
            <header className="mb-4">
                <BackButton />
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <FileSignature className="h-8 w-8" />
                    Edit Quotation / Rate List
                </h1>
            </header>
            <QuotationForm quotationId={Number(id)} />
        </main>
    );
}

export default function EditQuotationRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <EditQuotationPage />
      </DashboardLayout>
    </Suspense>
  );
}
