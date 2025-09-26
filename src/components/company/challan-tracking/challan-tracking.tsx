
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export function ChallanTracking() {
  return (
    <main className="flex-1 p-4 md:p-6 bg-[#e0f7fa]">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <ClipboardList className="h-8 w-8" />
          Challan Tracking
        </h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Challan Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-8">
            <p>This feature is temporarily disabled to ensure application stability.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
