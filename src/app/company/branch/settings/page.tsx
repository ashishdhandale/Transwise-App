
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

function BranchSettingsPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-8">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold tracking-tight font-headline mb-6 flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Branch Settings
          </h1>
          <Card>
              <CardHeader>
                  <CardTitle>Branch Preferences</CardTitle>
                  <CardDescription>Manage settings specific to this branch.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">Branch-specific settings will be implemented here.</p>
              </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
}

export default function BranchSettingsRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <BranchSettingsPage />
    </Suspense>
  );
}
