'use client';

import { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardLayout from '../../(dashboard)/layout';
import AddCompanyForm from '@/components/admin/add-company-form';

function AddCompanyPage() {
  return (
    <SidebarProvider>
      <DashboardLayout>
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">
                    Add New User Business Details
                </h1>
                <AddCompanyForm />
            </div>
        </main>
      </DashboardLayout>
    </SidebarProvider>
  );
}

export default function AddCompanyRootPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddCompanyPage />
        </Suspense>
    )
}
