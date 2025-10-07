'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data: any[] = [
  // Data will be populated dynamically
];

export function TotalCollectedChart() {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Sales" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Amount" stroke="hsl(var(--chart-2))" />
           <Line type="monotone" dataKey="Extra" stroke="hsl(var(--chart-3))" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
