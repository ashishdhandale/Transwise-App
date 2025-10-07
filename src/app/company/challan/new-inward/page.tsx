
'use client';

import DashboardLayout from '../../../(dashboard)/layout';
import { NewInwardChallanForm } from '@/components/company/challan/new-inward-challan-form';

function NewInwardChallanPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <NewInwardChallanForm />
      </main>
    </DashboardLayout>
  );
}

export default function NewInwardChallanRootPage() {
  return <NewInwardChallanPage />;
}
