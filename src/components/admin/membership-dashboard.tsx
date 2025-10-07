
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { onlineInquiries, existingUsers } from '@/lib/sample-data';

export function MembershipDashboard() {

  const registeredUsers = onlineInquiries.length + existingUsers.length;
  const activeUsers = existingUsers.length;
  const pendingRequests = onlineInquiries.filter(i => i.status === 'New').length;
  const activeMemberships = existingUsers.filter(u => u.licenceType !== 'Trial').length;

  const summaryData = [
    {
      value: registeredUsers.toString(),
      label: 'Registered Users',
      color: 'bg-primary',
    },
    {
      value: activeUsers.toString(),
      label: 'Active users',
      color: 'bg-primary',
    },
    {
      value: pendingRequests.toString(),
      label: 'Pending Request',
      color: 'bg-accent',
    },
    {
      value: activeMemberships.toString(),
      label: 'Active Membership',
      color: 'bg-accent',
    },
  ];

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
