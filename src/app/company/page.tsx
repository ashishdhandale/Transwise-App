'use client';

import { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardLayout from '../(dashboard)/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function CompanyDashboard() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Company Dashboard
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, Company Manager!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is where you can manage your branches, users, and view company-wide analytics.</p>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}


function CompanyPage() {
  return (
    <SidebarProvider>
      <DashboardLayout>
        <CompanyDashboard />
      </DashboardLayout>
    </SidebarProvider>
  );
}

export default function CompanyRootPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompanyPage />
        </Suspense>
    )
}
