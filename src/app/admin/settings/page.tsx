
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { MarketingTemplates } from '@/components/admin/marketing-templates';
import { CouponGenerator } from '@/components/admin/coupon-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function SettingsPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">
          Settings
        </h1>
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Marketing Templates</TabsTrigger>
            <TabsTrigger value="coupons">Coupon Management</TabsTrigger>
          </TabsList>
          <TabsContent value="templates">
            <MarketingTemplates />
          </TabsContent>
          <TabsContent value="coupons">
            <CouponGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default function SettingsRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <SettingsPage />
      </DashboardLayout>
    </Suspense>
  );
}
