
'use client';

import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VehicleExpensesDashboard() {
  return (
    <main className="flex-1 p-4 md:p-6">
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Wrench className="h-8 w-8" />
                Vehicle Expenses
            </h1>
        </header>
        <Card>
            <CardHeader>
                <CardTitle>Log and Track Vehicle Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                <p>This section is under construction. Here you will be able to log expenses for maintenance, fuel, and parts for each vehicle.</p>
            </CardContent>
        </Card>
    </main>
  );
}
