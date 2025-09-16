'use client';

import { PawPrint } from 'lucide-react';
import { SearchPanel } from './search-panel';
import { SearchResults } from './search-results';
import { ShippingDetails } from './shipping-details';

export function PackageTracking() {
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
          <SearchPanel />
        </div>
        <div className="w-full lg:w-3/4 space-y-4">
          <SearchResults />
          <ShippingDetails />
        </div>
      </div>
    </main>
  );
}
