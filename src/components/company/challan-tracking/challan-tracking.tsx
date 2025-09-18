
'use client';

import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { SearchFilters } from './search-filters';
import { SearchResultsTable } from './search-results-table';
import { ChallanDetails } from './challan-details';
import { LrDetailsTable } from './lr-details-table';
import { SummarySection } from './summary-section';
import { getChallanData, getLrDetailsData, type Challan } from '@/lib/challan-data';

export function ChallanTracking() {
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [lrDetails, setLrDetails] = useState(getLrDetailsData());

  useEffect(() => {
    setChallans(getChallanData());
  }, []);

  return (
    <main className="flex-1 p-4 md:p-6 bg-[#e0f7fa]">
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            Challan Tracking
            </h1>
      </header>

      <div className="space-y-4">
        <SearchFilters />
        <SearchResultsTable 
          challans={challans} 
          onSelectChallan={setSelectedChallan} 
          selectedChallanId={selectedChallan?.challanId}
        />
        
        {selectedChallan && (
            <div className="border bg-card shadow-sm rounded-lg p-4">
                <ChallanDetails challan={selectedChallan} />
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <LrDetailsTable lrDetails={lrDetails} />
                    </div>
                    <div>
                        <SummarySection challan={selectedChallan} />
                    </div>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}
