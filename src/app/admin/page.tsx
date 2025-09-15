'use client';

import { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardLayout from '../(dashboard)/layout';
import AdminDashboard from '@/components/admin/admin-dashboard';

function AdminPage() {
  return (
    <SidebarProvider>
      <DashboardLayout>
        <AdminDashboard />
      </DashboardLayout>
    </SidebarProvider>
  );
}

export default function AdminRootPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminPage />
        </Suspense>
    )
}
