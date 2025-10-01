
'use client';

import { Users } from 'lucide-react';
import { StaffManagement } from './staff-management';


export function StaffDashboard() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <header className="mb-4">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Users className="h-8 w-8" />
              Staff Management
          </h1>
      </header>
      <StaffManagement />
    </main>
  );
}
