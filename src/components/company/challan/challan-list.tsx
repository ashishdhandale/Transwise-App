
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ChallanList() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Challan Management
        </h1>
        <div className="flex items-center gap-4">
          <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
            <Link href="/company/challan/new">Dispatch Challan</Link>
          </Button>
          <Button className="bg-orange-400 hover:bg-orange-500 text-white" disabled>
            Inward Challan
          </Button>
          <Button className="bg-purple-500 hover:bg-purple-600 text-white" disabled>
            Import Challan
          </Button>
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Challan List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-8">
            <p>This section is temporarily unavailable while we resolve a stability issue.</p>
            <p>You can still create new challans using the button above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
