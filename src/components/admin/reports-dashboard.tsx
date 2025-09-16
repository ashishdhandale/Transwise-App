'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TotalCollectedChart } from './total-collected-chart';
import { ThisMonthCharts } from './this-month-charts';
import { SalesByMembershipChart } from './sales-by-membership-chart';

export default function ReportsDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total Collected All Time (line graph)</CardTitle>
          </CardHeader>
          <CardContent>
            <TotalCollectedChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ThisMonthCharts />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales By Membership</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesByMembershipChart />
        </CardContent>
      </Card>
    </div>
  );
}
