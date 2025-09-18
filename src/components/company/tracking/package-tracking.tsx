
'use client';

import { useState, useEffect } from 'react';
import { PawPrint } from 'lucide-react';
import { SearchPanel } from './search-panel';
import { SearchResults } from './search-results';
import { ShippingDetails } from './shipping-details';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getHistoryLogs, type BookingHistory } from '@/lib/history-data';
import { getBookings } from '@/lib/bookings-dashboard-data';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';

const LOCAL_STORAGE_KEY_BOOKINGS = 'transwise_bookings';

export function PackageTracking() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingHistory, setSelectedBookingHistory] = useState<BookingHistory | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

  useEffect(() => {
    async function loadData() {
        setAllBookings(getBookings());
        const profile = await getCompanyProfile();
        setCompanyProfile(profile);
    }
    loadData();
  }, []);

  const handleSearch = (grNumber: string) => {
    if (!grNumber) {
      setSearchResults([]);
      setSelectedBooking(null);
      setSelectedBookingHistory(null);
      return;
    }
    const results = allBookings.filter(b => b.lrNo.toLowerCase().includes(grNumber.toLowerCase()));
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
    const history = allHistory.find(h => h.id === booking.lrNo) || null;
    setSelectedBookingHistory(history);
  };


  return (
    <main className="flex-1 p-4 md:p-6 bg-white">
      <header className="border-b-2 border-primary pb-2 mb-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <PawPrint className="h-8 w-8" />
          Package Tracking
        </h1>
      </header>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4">
          <SearchPanel onSearch={handleSearch} />
        </div>
        <div className="w-full lg:w-3/4 space-y-4">
          <SearchResults results={searchResults} onSelectResult={handleSelectBooking} selectedLrNo={selectedBooking?.lrNo} />
          <ShippingDetails booking={selectedBooking} history={selectedBookingHistory} profile={companyProfile} />
        </div>
      </div>
    </main>
  );
}
