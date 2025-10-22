'use client';

import { Suspense, useEffect, useState } from 'react';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { DeliveriesList } from '@/components/dashboard/deliveries-list';
import { MapView } from '@/components/dashboard/map-view';
import { OptimizerForm } from '@/components/dashboard/optimizer-form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClientOnly } from '@/components/ui/client-only';
import { getBookings } from '@/lib/bookings-dashboard-data';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { loadCompanySettingsFromStorage } from '@/app/company/settings/actions';

// Temporary function to calculate the next LR number
const getNextLrNumber = (): string => {
  try {
    const allBookings = getBookings();
    const companyProfile = loadCompanySettingsFromStorage();

    const systemBookings = allBookings.filter(b => !b.source || b.source === 'System');

    const lastSequence = systemBookings.reduce((maxSeq, booking) => {
      const match = booking.lrNo.match(/\d+$/);
      if (match) {
        const currentSeq = parseInt(match[0], 10);
        if (!isNaN(currentSeq) && currentSeq > maxSeq) {
          return currentSeq;
        }
      }
      return maxSeq;
    }, 0);

    const newSequence = lastSequence + 1;
    const prefix = companyProfile?.grnFormat === 'with_char' ? (companyProfile.lrPrefix?.trim() || '') : '';
    
    return `${prefix}${String(newSequence).padStart(2, '0')}`;
  } catch (e) {
    console.error(e);
    return "Could not calculate";
  }
};


function Dashboard() {
  const [nextLr, setNextLr] = useState('');

  useEffect(() => {
    setNextLr(getNextLrNumber());
  }, []);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {nextLr && (
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Next LR Number Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">If you create a new booking now, the next automatically generated LR number will be: <strong className="text-2xl text-blue-600">{nextLr}</strong></p>
          </CardContent>
        </Card>
      )}
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h1>
      </div>
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="optimizer">Route Optimizer</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-4">
          <SummaryCards />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <ClientOnly>
                <DeliveriesList />
              </ClientOnly>
            </div>
            <div className="lg:col-span-3">
              <ClientOnly>
                <MapView />
              </ClientOnly>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Route Optimizer</CardTitle>
              <CardDescription>
                Select deliveries and set parameters to generate an optimized route using AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <OptimizerForm />
              </ClientOnly>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
