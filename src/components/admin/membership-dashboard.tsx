import { Card, CardContent } from '@/components/ui/card';

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
    </div>
  );
}
