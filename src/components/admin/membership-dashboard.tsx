import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TotalCollectedChart } from './total-collected-chart';
import { ThisMonthCharts } from './this-month-charts';
import { SalesByMembershipChart } from './sales-by-membership-chart';

const summaryData = [
  {
    value: '250',
    label: 'Registered Users',
    color: 'bg-primary',
  },
  {
    value: '100',
    label: 'Active users',
    color: 'bg-primary',
  },
  {
    value: '50',
    label: 'Pending Request',
    color: 'bg-accent',
  },
  {
    value: '90',
    label: 'Active Membership',
    color: 'bg-accent',
  },
];

export function MembershipDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Membership Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item) => (
          <Card key={item.label} className={`${item.color} text-primary-foreground`}>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold">{item.value}</div>
              <p className="text-sm">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total Collected All Time(line graph)</CardTitle>
          </CardHeader>
          <CardContent>
            <TotalCollectedChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ThisMonthCharts />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales By Membership</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesByMembershipChart />
        </CardContent>
      </Card>
    </div>
  );
}
