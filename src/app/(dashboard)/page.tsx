'use client';

import { Suspense } from 'react';
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

function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
              <DeliveriesList />
            </div>
            <div className="lg:col-span-3">
              <MapView />
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
              <OptimizerForm />
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
