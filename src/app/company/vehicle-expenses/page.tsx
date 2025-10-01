
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { VehicleExpensesDashboard } from '@/components/company/vehicle-expenses/vehicle-expenses-dashboard';

function VehicleExpensesPage() {
  return (
    <DashboardLayout>
      <VehicleExpensesDashboard />
    </DashboardLayout>
  );
}

export default function VehicleExpensesRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VehicleExpensesPage />
    </Suspense>
  );
}
