'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', Sales: 4000, Amount: 2400, Extra: 1200 },
  { name: 'Feb', Sales: 3000, Amount: 1398, Extra: 2210 },
  { name: 'Mar', Sales: 2000, Amount: 9800, Extra: 3290 },
  { name: 'Apr', Sales: 2780, Amount: 3908, Extra: 1500 },
  { name: 'May', Sales: 1890, Amount: 4800, Extra: 2181 },
  { name: 'Jun', Sales: 2390, Amount: 3800, Extra: 2500 },
  { name: 'Jul', Sales: 3490, Amount: 4300, Extra: 2100 },
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
