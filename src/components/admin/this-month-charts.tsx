
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { sampleExistingUsers as existingUsers } from '@/lib/sample-data';
import { useMemo } from 'react';

const amountData = [
  { name: 'Week 1', Amount: 4000 },
  { name: 'Week 2', Amount: 3000 },
  { name: 'Week 3', Amount: 5000 },
  { name: 'Week 4', Amount: 4500 },
];

const salesData = [
  { name: 'Week 1', Sale: 20 },
  { name: 'Week 2', Sale: 15 },
  { name: 'Week 3', Sale: 25 },
  { name: 'Week 4', Sale: 22 },
];

const getLicenseValue = (licenseType: "Trial" | "Bronze" | "Gold" | "Platinum") => {
    switch(licenseType) {
        case 'Platinum': return 1000;
        case 'Gold': return 500;
        case 'Bronze': return 250;
        case 'Trial': return 0;
        default: return 0;
    }
}

export function ThisMonthCharts() {

  const { totalAmount, totalSales } = useMemo(() => {
    const totalAmount = existingUsers.reduce((sum, user) => sum + getLicenseValue(user.licenceType), 0);
    const totalSales = existingUsers.length;
    return { totalAmount, totalSales };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-center font-bold text-lg">Rs. {totalAmount.toLocaleString()}</h3>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={amountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={() => null} />
              <YAxis tick={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="Amount" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1">Amount</p>
      </div>
      <div>
        <h3 className="text-center font-bold text-lg">{totalSales} IDs</h3>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={() => null} />
              <YAxis tick={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="Sale" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1">Sale</p>
      </div>
    </div>
  );
}
