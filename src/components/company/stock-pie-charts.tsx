'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Raipur', value: 400 },
  { name: 'Jabalpur', value: 300 },
  { name: 'Bhandara', value: 300 },
  { name: 'Akola', value: 200 },
];

const COLORS = ['#ef5350', '#ffca28', '#66bb6a', '#ec407a'];

const PieChartCard = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center w-full">
    <h3 className="text-center font-semibold mb-2">{title}</h3>
    <div className="w-full h-48">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export function StockPieCharts() {
  return (
    <Card className="border border-[#b2dfdb]">
      <CardHeader>
        <CardTitle className="text-lg">Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PieChartCard title="Stock by Stations" />
          <PieChartCard title="Undelivered Stock by Stations" />
          <PieChartCard title="Deliveries By Destinations" />
        </div>
      </CardContent>
    </Card>
  );
}
