'use client';

import { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardLayout from '../(dashboard)/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function EmployeeDashboard() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Driver Portal
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Your Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Welcome! Here you can see your assigned deliveries for the day.</p>
                    {/* Delivery list for the employee will go here */}
                </CardContent>
            </Card>
        </div>
    </main>
  );
}


function EmployeePage() {
  return (
    <SidebarProvider>
      <DashboardLayout>
        <EmployeeDashboard />
      </DashboardLayout>
    </SidebarProvider>
  );
}

export default function EmployeeRootPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmployeePage />
        </Suspense>
    )
}
