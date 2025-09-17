
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
import { useMemo } from 'react';

// Function to generate a color from a string
const generateColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

interface PieChartData {
    station: string;
    stock: number;
}

const PieChartCard = ({ title, data, chartConfig }: { title: string, data: PieChartData[], chartConfig: ChartConfig }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="flex flex-col border-0 shadow-none">
                <CardHeader className="items-center pb-0">
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-0 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No data available.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
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
                        <Cell key={entry.station} fill={generateColor(entry.station)} stroke={generateColor(entry.station)} />
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
};

interface StockPieChartsProps {
    stationData: PieChartData[];
    undeliveredData: PieChartData[];
    destinationData: PieChartData[];
}

export function StockPieCharts({ stationData, undeliveredData, destinationData }: StockPieChartsProps) {
  const buildChartConfig = (data: PieChartData[]): ChartConfig => {
    const config: ChartConfig = { stock: { label: 'Stock' } };
    data.forEach(item => {
      config[item.station] = {
        label: item.station,
        color: generateColor(item.station),
      };
    });
    return config;
  };

  const stationChartConfig = useMemo(() => buildChartConfig(stationData), [stationData]);
  const undeliveredChartConfig = useMemo(() => buildChartConfig(undeliveredData), [undeliveredData]);
  const destinationChartConfig = useMemo(() => buildChartConfig(destinationData), [destinationData]);

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
