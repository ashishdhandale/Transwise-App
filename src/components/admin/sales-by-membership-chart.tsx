'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', Trial: 4000, Bronze: 2400, Gold: 1400, Platinum: 500 },
  { name: 'Feb', Trial: 3000, Bronze: 1398, Gold: 1210, Platinum: 800 },
  { name: 'Mar', Trial: 2000, Bronze: 9800, Gold: 2290, Platinum: 1200 },
  { name: 'Apr', Trial: 2780, Bronze: 3908, Gold: 2000, Platinum: 1500 },
  { name: 'May', Trial: 1890, Bronze: 4800, Gold: 2181, Platinum: 1800 },
  { name: 'Jun', Trial: 2390, Bronze: 3800, Gold: 2500, Platinum: 2100 },
  { name: 'Jul', Trial: 3490, Bronze: 4300, Gold: 2100, Platinum: 2400 },
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
