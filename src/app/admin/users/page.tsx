
'use client';

import { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardLayout from '../../(dashboard)/layout';
import { UserManagementTables } from '@/components/admin/user-management-tables';
import { BackButton } from '@/components/ui/back-button';

function UserManagementPage() {
  return (
    <SidebarProvider>
      <DashboardLayout>
        <main className="flex-1 p-4 md:p-8">
            <div>
                 <BackButton />
                 <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">
                    User Management
                </h1>
                <UserManagementTables />
            </div>
        </main>
      </DashboardLayout>
    </SidebarProvider>
  );
}

export default function UserManagementRootPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserManagementPage />
        </Suspense>
    )
}
