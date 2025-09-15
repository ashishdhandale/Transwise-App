import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const summaryData = [
  {
    title: 'Total Deliveries',
    value: '1,250',
    change: '+15.2% from last month',
    icon: Truck,
  },
  {
    title: 'On-Time Rate',
    value: '98.5%',
    change: '+2.1% from last month',
    icon: CheckCircle,
  },
  {
    title: 'Avg. Delivery Time',
    value: '45 min',
    change: '-3.5% from last month',
    icon: Clock,
  },
  {
    title: 'Active Alerts',
    value: '3',
    change: '1 new alert',
    icon: AlertTriangle,
  },
];

export function SummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
