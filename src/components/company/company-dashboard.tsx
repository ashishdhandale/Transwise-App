
'use client';

import { useState, useEffect, useMemo } from 'react';
import { BookingsChart } from './bookings-chart';
import { DashboardFilters } from './dashboard-filters';
import { StockPieCharts } from './stock-pie-charts';
import { TodaysBusinessCards } from './todays-business-cards';
import { Monitor } from 'lucide-react';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { isToday, subDays, format, parseISO } from 'date-fns';
import { loadCompanySettingsFromStorage } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';
import { Reminders } from './reminders';
import { useSearchParams } from 'next/navigation';
import { getBranches, type Branch } from '@/lib/branch-data';

export function CompanyDashboard() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
  
  const searchParams = useSearchParams();
  const userRole = searchParams.get('role') === 'Branch' ? 'Branch' : 'Company';
  // In a real app, you'd get the actual branch name from the user's session
  const userBranchName = userRole === 'Company' ? undefined : 'Pune Hub'; 

  useEffect(() => {
    function loadData() {
        setAllBookings(getBookings());
        const profile = loadCompanySettingsFromStorage();
        setCompanyProfile(profile);
    }
    loadData();
  }, []);

  const dashboardBookings = useMemo(() => {
    if (userRole === 'Company') {
      return allBookings; // Company user sees all bookings
    }
    // Branch user sees only their branch's bookings
    return allBookings.filter(b => b.branchName === userBranchName);
  }, [allBookings, userRole, userBranchName]);


  const todaysBusinessData = useMemo(() => {
    const todaysBookings = dashboardBookings.filter(b => isToday(parseISO(b.bookingDate)));
    const todaysDeliveries = dashboardBookings.filter(b => b.status === 'Delivered' && b.bookingDate && isToday(parseISO(b.bookingDate)));
    const todaysCancellations = dashboardBookings.filter(b => b.status === 'Cancelled' && b.bookingDate && isToday(parseISO(b.bookingDate)));

    const bookingsRevenue = todaysBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return [
      { title: 'Bookings', value: todaysBookings.length.toString() },
      { title: 'Deliveries', value: todaysDeliveries.length.toString() },
      { title: 'Cancelled Bookings', value: todaysCancellations.length.toString() },
      { title: 'Vehicle Dispatch', value: '0' },
      { title: 'Vehicle Inward', value: '0' },
      { title: 'Revenue', value: bookingsRevenue.toString(), isCurrency: true },
    ];
  }, [dashboardBookings]);

  const bookingsChartData = useMemo(() => {
    const last13Days = Array.from({ length: 13 }, (_, i) => subDays(new Date(), i)).reverse();
    return last13Days.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const day = format(date, 'dd');
      const count = dashboardBookings.filter(b => b.bookingDate && format(parseISO(b.bookingDate), 'yyyy-MM-dd') === dateString).length;
      return { name: day, count };
    });
  }, [dashboardBookings]);

  const stockPieChartData = useMemo(() => {
    const stationStock: { [key: string]: number } = {};
    const undeliveredStock: { [key: string]: number } = {};
    const destinationDeliveries: { [key: string]: number } = {};

    dashboardBookings.forEach(booking => {
      // Stock by current station (items not yet in transit)
      if (['In Stock', 'In Loading', 'In HOLD'].includes(booking.status)) {
        stationStock[booking.fromCity] = (stationStock[booking.fromCity] || 0) + 1;
      }
      
      // Undelivered stock (all items not yet delivered)
      if (booking.status !== 'Delivered' && booking.status !== 'Cancelled') {
        undeliveredStock[booking.fromCity] = (undeliveredStock[booking.fromCity] || 0) + 1;
      }

      // Deliveries by destination
      if (booking.status === 'Delivered') {
        destinationDeliveries[booking.toCity] = (destinationDeliveries[booking.toCity] || 0) + 1;
      }
    });

    const formatForChart = (data: { [key: string]: number }) => Object.entries(data).map(([station, stock]) => ({ station, stock }));

    return {
      stationData: formatForChart(stationStock),
      undeliveredData: formatForChart(undeliveredStock),
      destinationData: formatForChart(destinationDeliveries),
    };
  }, [dashboardBookings]);


  return (
    <main className="flex-1 p-4 md:p-6 bg-[#e0f7fa]">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-[#00796b] flex items-center gap-2">
          <Monitor className="h-7 w-7" />
          Dashboard
        </h1>
      </div>
      <DashboardFilters userRole={userRole} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Reminders />
          <BookingsChart data={bookingsChartData} />
          <StockPieCharts {...stockPieChartData} />
        </div>
        <div>
          <TodaysBusinessCards data={todaysBusinessData} profile={companyProfile} />
        </div>
      </div>
    </main>
  );
}
