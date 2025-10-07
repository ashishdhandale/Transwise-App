'use client';

import { MembershipDashboard } from './membership-dashboard';
import { ThisMonthCharts } from './this-month-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  return (
      <main className="flex-1 p-4 md:p-8 space-y-6">
        <MembershipDashboard />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <ThisMonthCharts />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
  );
}
