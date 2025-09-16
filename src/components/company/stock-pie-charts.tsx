'use client';

import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const stationData = [
  { station: 'Raipur', stock: 400, fill: 'var(--color-raipur)' },
  { station: 'Jabalpur', stock: 300, fill: 'var(--color-jabalpur)' },
  { station: 'Bhandara', stock: 300, fill: 'var(--color-bhandara)' },
  { station: 'Akola', stock: 200, fill: 'var(--color-akola)' },
];

const undeliveredData = [
  { station: 'Nagpur', stock: 250, fill: 'var(--color-nagpur)' },
  { station: 'Pune', stock: 150, fill: 'var(--color-pune)' },
  { station: 'Mumbai', stock: 100, fill: 'var(--color-mumbai)' },
];

const destinationData = [
    { station: 'Kolkata', stock: 500, fill: 'var(--color-kolkata)' },
    { station: 'Delhi', stock: 350, fill: 'var(--color-delhi)' },
    { station: 'Chennai', stock: 250, fill: 'var(--color-chennai)' },
];

const stationChartConfig = {
  stock: {
    label: 'Stock',
  },
  raipur: {
    label: 'Raipur',
    color: 'hsl(var(--chart-1))',
  },
  jabalpur: {
    label: 'Jabalpur',
    color: 'hsl(var(--chart-2))',
  },
  bhandara: {
    label: 'Bhandara',
    color: 'hsl(var(--chart-3))',
  },
  akola: {
    label: 'Akola',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

const undeliveredChartConfig = {
    stock: {
        label: 'Stock',
    },
    nagpur: {
        label: 'Nagpur',
        color: 'hsl(var(--chart-1))',
    },
    pune: {
        label: 'Pune',
        color: 'hsl(var(--chart-2))',
    },
    mumbai: {
        label: 'Mumbai',
        color: 'hsl(var(--chart-3))',
    },
} satisfies ChartConfig;

const destinationChartConfig = {
    stock: {
        label: 'Deliveries',
    },
    kolkata: {
        label: 'Kolkata',
        color: 'hsl(var(--chart-1))',
    },
    delhi: {
        label: 'Delhi',
        color: 'hsl(var(--chart-2))',
    },
    chennai: {
        label: 'Chennai',
        color: 'hsl(var(--chart-3))',
    },
} satisfies ChartConfig;


const PieChartCard = ({ title, data, chartConfig }: { title: string, data: any[], chartConfig: ChartConfig }) => (
  <Card className="flex flex-col border-0 shadow-none">
    <CardHeader className="items-center pb-0">
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="stock"
            nameKey="station"
            innerRadius={60}
            strokeWidth={5}
          >
            {data.map((entry) => (
                <Cell key={entry.station} fill={entry.fill} stroke={entry.fill} />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="station" />}
            className="-translate-y-[2px] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export function StockPieCharts() {
  return (
    <Card className="border border-[#b2dfdb]">
      <CardHeader>
        <CardTitle className="text-lg">Stock Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PieChartCard title="Stock by Stations" data={stationData} chartConfig={stationChartConfig}/>
          <PieChartCard title="Undelivered Stock" data={undeliveredData} chartConfig={undeliveredChartConfig}/>
          <PieChartCard title="Deliveries By Destination" data={destinationData} chartConfig={destinationChartConfig}/>
        </div>
      </CardContent>
    </Card>
  );
}
