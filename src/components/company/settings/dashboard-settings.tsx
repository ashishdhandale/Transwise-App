
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { AllCompanySettings } from '@/app/company/settings/actions';


export const dashboardSettingsSchema = z.object({
  vehicleDocReminderDays: z.coerce
    .number()
    .min(1, 'Must be at least 1 day.')
    .max(90, 'Cannot exceed 90 days.'),
});

type SettingsFormValues = z.infer<typeof dashboardSettingsSchema>;

export function DashboardSettings() {
  const form = useFormContext<AllCompanySettings>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Dashboard Preferences</CardTitle>
        <CardDescription>Customize the reminders and notifications shown on the main dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
            <FormField
                control={form.control}
                name="vehicleDocReminderDays"
                render={({ field }) => (
                    <FormItem className="max-w-xs">
                        <FormLabel>Vehicle Document Reminder</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <span>days in advance</span>
                        </div>
                         <FormDescription>
                            Set how many days before expiry to show a reminder for vehicle documents.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
      </CardContent>
    </Card>
  );
}