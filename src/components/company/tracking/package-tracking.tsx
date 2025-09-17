'use client';

import { useState } from 'react';
import { PawPrint } from 'lucide-react';
import { SearchPanel } from './search-panel';
import { SearchResults } from './search-results';
import { ShippingDetails } from './shipping-details';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { sampleBookings } from '@/lib/bookings-dashboard-data';
import { historyData, type BookingHistory } from '@/lib/history-data';

export function PackageTracking() {
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingHistory, setSelectedBookingHistory] = useState<BookingHistory | null>(null);

  const handleSearch = (grNumber: string) => {
    if (!grNumber) {
      setSearchResults([]);
      setSelectedBooking(null);
      setSelectedBookingHistory(null);
      return;
    }
    const results = sampleBookings.filter(b => b.lrNo.toLowerCase().includes(grNumber.toLowerCase()));
    setSearchResults(results);
    // If there's only one result, select it automatically
    if (results.length === 1) {
      handleSelectBooking(results[0]);
    } else {
      setSelectedBooking(null);
      setSelectedBookingHistory(null);
    }
  };

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    // Find corresponding history
    const history = historyData.find(h => h.id === booking.lrNo);
    setSelectedBookingHistory(history || null);
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
          <ShippingDetails booking={selectedBooking} history={selectedBookingHistory} />
        </div>
      </div>
    </main>
  );
}
