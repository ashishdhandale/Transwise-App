
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { BulkDeliveryForm } from '@/components/company/deliveries/bulk-delivery-form';


function BulkDeliveryPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <BulkDeliveryForm />
      </main>
    </DashboardLayout>
  );
}

export default function BulkDeliveryRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BulkDeliveryPage />
    </Suspense>
  );
}
