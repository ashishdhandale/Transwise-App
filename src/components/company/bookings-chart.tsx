
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

interface BookingsChartProps {
    data: { name: string; count: number }[];
}

export function BookingsChart({ data }: BookingsChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 0);
  const yAxisDomain = [0, maxCount > 0 ? Math.ceil(maxCount / 10) * 10 : 10];
  
  return (
    <Card className="border border-[#b2dfdb]">
      <CardHeader>
        <CardTitle className="text-center text-red-700 font-bold">
          Daily Bookings
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
                domain={yAxisDomain}
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
