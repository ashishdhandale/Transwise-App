'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: '01', count: 20 },
  { name: '02', count: 30 },
  { name: '03', count: 40 },
  { name: '04', count: 60 },
  { name: '05', count: 90 },
  { name: '06', count: 50 },
  { name: '07', count: 80 },
  { name: '08', count: 100 },
  { name: '09', count: 40 },
  { name: '10', count: 50 },
  { name: '11', count: 100 },
  { name: '12', count: 50 },
  { name: '13', count: 60 },
];

export function BookingsChart() {
  return (
    <Card className="border border-[#b2dfdb]">
      <CardHeader>
        <CardTitle className="text-center text-red-700 font-bold">
          Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[0, 100]}
                ticks={[20, 40, 60, 80, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #ccc',
                }}
              />
              <Bar dataKey="count" fill="#ef5350" barSize={30}>
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
