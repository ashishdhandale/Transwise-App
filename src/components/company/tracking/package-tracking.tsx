

'use client';

import { useState, useEffect } from 'react';
import { PawPrint, Search } from 'lucide-react';
import { SearchPanel } from './search-panel';
import { SearchResults } from './search-results';
import { ShippingDetails } from './shipping-details';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getHistoryLogs, type BookingHistory } from '@/lib/history-data';
import { getBookings } from '@/lib/bookings-dashboard-data';
import { loadCompanySettingsFromStorage } from '@/app/company/settings/actions';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import { Card } from '@/components/ui/card';
import { getChallanData, getLrDetailsData, type LrDetail } from '@/lib/challan-data';

export function PackageTracking() {
  const [allTrackableItems, setAllTrackableItems] = useState<Booking[]>([]);
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingHistory, setSelectedBookingHistory] = useState<BookingHistory | null>(null);
  const [companyProfile, setCompanyProfile] = useState<AllCompanySettings | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [allLrDetails, setAllLrDetails] = useState<LrDetail[]>([]);

  useEffect(() => {
    function loadData() {
        const bookings = getBookings();
        setAllTrackableItems(bookings);
        const profile = loadCompanySettingsFromStorage();
        setCompanyProfile(profile);
        setAllLrDetails(getLrDetailsData());
    }
    loadData();
  }, []);

  const handleSearch = (id: string) => {
    setHasSearched(true);
    if (!id) {
      setSearchResults([]);
      setSelectedBooking(null);
      setSelectedBookingHistory(null);
      return;
    }
    const lowercasedId = id.toLowerCase();
    const results = allTrackableItems.filter(b => 
        b.lrNo.toLowerCase().includes(lowercasedId) ||
        String(b.trackingId).toLowerCase().includes(lowercasedId)
    );
    setSearchResults(results);

    if (results.length === 1) {
      handleSelectBooking(results[0]);
    } else {
      setSelectedBooking(null);
      setSelectedBookingHistory(null);
    }
  };

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    const allHistory = getHistoryLogs();
    // History is tied to the LR Number (lrNo)
    const history = allHistory.find(h => h.id === booking.lrNo) || null;
    setSelectedBookingHistory(history);
  };


  return (
    <main className="flex-1 p-4 md:p-6 bg-secondary/30">
      <header className="pb-2 mb-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <PawPrint className="h-8 w-8" />
          Package Tracking
        </h1>
      </header>
      <div className="space-y-6">
        <SearchPanel onSearch={handleSearch} />
        
        {hasSearched && (
            <SearchResults 
                results={searchResults} 
                onSelectResult={handleSelectBooking} 
                selectedTrackingId={selectedBooking?.trackingId}
                lrDetails={allLrDetails}
            />
        )}
        
        {selectedBooking ? (
            <ShippingDetails booking={selectedBooking} history={selectedBookingHistory} profile={companyProfile} />
        ) : (
            <Card className="flex h-80 items-center justify-center border-dashed border-2">
                <div className="text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto" />
                    <p className="mt-2 font-medium">Search for an LR No. to see its details.</p>
                    <p className="text-sm">The shipping and delivery details will appear here.</p>
                </div>
            </Card>
        )}
      </div>
    </main>
  );
}
