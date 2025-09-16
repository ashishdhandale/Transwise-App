'use client';

import { BookingsChart } from './bookings-chart';
import { DashboardFilters } from './dashboard-filters';
import { StockPieCharts } from './stock-pie-charts';
import { TodaysBusinessCards } from './todays-business-cards';
import { Monitor } from 'lucide-react';

export function CompanyDashboard() {
  return (
    <main className="flex-1 p-4 md:p-6 bg-[#e0f7fa]">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-[#00796b] flex items-center gap-2">
          <Monitor className="h-7 w-7" />
          Dashboard
        </h1>
      </div>
      <DashboardFilters />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <BookingsChart />
          <StockPieCharts />
        </div>
        <div>
          <TodaysBusinessCards />
        </div>
      </div>
    </main>
  );
}
