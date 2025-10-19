

'use client';

import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { SearchFilters } from './search-filters';
import { SearchResultsTable } from './search-results-table';
import { ChallanDetails } from './challan-details';
import { LrDetailsTable } from './lr-details-table';
import { SummarySection } from './summary-section';
import { getChallanData, getLrDetailsData } from '@/lib/challan-data';
import type { Challan, LrDetail } from '@/lib/challan-data';
import type { AllCompanySettings } from '../settings/actions';
import { getCompanySettings } from '@/app/company/settings/actions';
import { Card } from '@/components/ui/card';

export function ChallanTracking() {
  const [allChallans, setAllChallans] = useState<Challan[]>([]);
  const [allLrDetails, setAllLrDetails] = useState<LrDetail[]>([]);
  const [filteredChallans, setFilteredChallans] = useState<Challan[]>([]);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [selectedLrDetails, setSelectedLrDetails] = useState<LrDetail[]>([]);
  const [profile, setProfile] = useState<AllCompanySettings | null>(null);

  useEffect(() => {
    async function loadData() {
        const challans = getChallanData();
        const lrDetails = getLrDetailsData();
        const companyProfile = await getCompanySettings();
        
        setAllChallans(challans);
        setAllLrDetails(lrDetails);
        setFilteredChallans(challans); // Initially show all
        setProfile(companyProfile);
    }
    loadData();
  }, []);

  const handleSelectChallan = (challan: Challan) => {
    setSelectedChallan(challan);
    const relatedLrs = allLrDetails.filter(lr => lr.challanId === challan.challanId);
    setSelectedLrDetails(relatedLrs);
  };
  
  return (
    <div className="space-y-4">
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <ClipboardList className="h-8 w-8" />
                Challan Tracking
            </h1>
        </header>

        <SearchFilters />

        <SearchResultsTable 
            challans={filteredChallans} 
            onSelectChallan={handleSelectChallan} 
            selectedChallanId={selectedChallan?.challanId}
        />
        
        {selectedChallan ? (
            <div className="space-y-4">
                <ChallanDetails challan={selectedChallan} profile={profile} />
                <LrDetailsTable lrDetails={selectedLrDetails} profile={profile} />
                <SummarySection challan={selectedChallan} profile={profile} />
            </div>
        ) : (
             <Card className="flex h-64 items-center justify-center border-dashed">
                <p className="text-muted-foreground">Select a challan from the search results to view its details.</p>
            </Card>
        )}
    </div>
  );
}
