'use client';

import { Suspense, useEffect, useState } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { NewInwardChallanForm } from '@/components/company/challan/new-inward-challan-form';
import { ClientOnly } from '@/components/ui/client-only';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getChallanData } from '@/lib/challan-data';

function NewInwardChallanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challanId = searchParams.get('challanId');
  const isEditMode = !!challanId;
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    if (isEditMode && challanId) {
      const allChallans = getChallanData();
      const challan = allChallans.find(c => c.challanId === challanId);
      if (challan && challan.status === 'Finalized') {
        setIsFinalized(true);
      }
    }
  }, [isEditMode, challanId]);
  
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-primary">
                {isEditMode ? 'Edit Inward Challan' : 'New Inward Challan'}
            </h1>
            <div className="flex items-center gap-2">
                <Button type="submit" form="inward-challan-form" size="sm">
                    <Save className="mr-2 h-4 w-4"/> {isEditMode ? 'Update & Finalize' : 'Finalize & Save Inward'}
                </Button>
                 {!isFinalized && (
                    <Button type="button" variant="outline" size="sm" form="inward-challan-form" id="save-temp-button">
                        <Save className="mr-2 h-4 w-4"/> {isEditMode ? 'Update Temp & Exit' : 'Save as Temp & Exit'}
                    </Button>
                 )}
                <Button type="button" variant="destructive" size="sm" onClick={() => router.push('/company/challan')}>
                    <X className="mr-2 h-4 w-4"/> Cancel & Exit
                </Button>
            </div>
        </div>
        <ClientOnly>
          <NewInwardChallanForm />
        </ClientOnly>
      </main>
    </DashboardLayout>
  );
}

export default function NewInwardChallanRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <NewInwardChallanPage />
    </Suspense>
  );
}
