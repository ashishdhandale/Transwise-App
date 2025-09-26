

'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import { SearchFilters } from './search-filters';
import { SearchResultsTable } from './search-results-table';
import { ChallanDetails } from './challan-details';
import { LrDetailsTable } from './lr-details-table';
import { SummarySection } from './summary-section';
import { getChallanData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { useSearchParams } from 'next/navigation';

function ChallanTrackingComponent() {
  const searchParams = useSearchParams();
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [allChallans, setAllChallans] = useState<Challan[]>([]);
  const [allLrDetails, setAllLrDetails] = useState<LrDetail[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

  useEffect(() => {
    async function loadData() {
        const profile = await getCompanyProfile();
        setCompanyProfile(profile);
        const challans = getChallanData();
        setAllChallans(challans);
        setAllLrDetails(getLrDetailsData());

        // Temporarily disable auto-loading from URL to prevent crashes
        // const challanIdFromUrl = searchParams.get('challanId');
        // if (challanIdFromUrl) {
        //     const challanToSelect = challans.find(c => c.challanId === challanIdFromUrl);
        //     if (challanToSelect) {
        //         setSelectedChallan(challanToSelect);
        //     }
        // }
    }
    loadData();
  }, [searchParams]);

  const filteredLrDetails = useMemo(() => {
    if (!selectedChallan) {
      return [];
    }
    return allLrDetails.filter(detail => detail.challanId === selectedChallan.challanId);
  }, [selectedChallan, allLrDetails]);

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
          challans={allChallans} 
          onSelectChallan={setSelectedChallan} 
          selectedChallanId={selectedChallan?.challanId}
        />
        
        {selectedChallan && (
            <div className="border bg-card shadow-sm rounded-lg p-4">
                <ChallanDetails challan={selectedChallan} profile={companyProfile} />
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <LrDetailsTable lrDetails={filteredLrDetails} profile={companyProfile} />
                    </div>
                    <div>
                        <SummarySection challan={selectedChallan} profile={companyProfile} />
                    </div>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}


export function ChallanTracking() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChallanTrackingComponent />
        </Suspense>
    )
}
