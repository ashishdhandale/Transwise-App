'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data: any[] = [
  // Data will be populated dynamically
];

export function SalesByMembershipChart() {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend wrapperStyle={{paddingTop: 20}} />
          <Line type="monotone" dataKey="Trial" stroke="hsl(var(--chart-1))" />
          <Line type="monotone" dataKey="Bronze" stroke="hsl(var(--chart-2))" />
          <Line type="monotone" dataKey="Gold" stroke="hsl(var(--chart-3))" />
          <Line type="monotone" dataKey="Platinum" stroke="hsl(var(--chart-4))" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
