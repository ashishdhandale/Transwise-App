
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function StaffDashboard() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <header className="mb-4">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Users className="h-8 w-8" />
              Staff Management
          </h1>
      </header>
      <Card>
          <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
              <p>Features like attendance, salary, leave, and performance analysis will be implemented here.</p>
          </CardContent>
      </Card>
    </main>
  );
}
