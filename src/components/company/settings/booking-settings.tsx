
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { AllCompanySettings } from '@/app/company/settings/actions';


export function BookingSettings() {
  const form = useFormContext<AllCompanySettings>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Booking Form Preferences</CardTitle>
        <CardDescription>Customize the default behavior of the new booking page.</CardDescription>
      </CardHeader>
      <CardContent>
          <FormField
              control={form.control}
              name="defaultItemRows"
              render={({ field }) => (
                  <FormItem className="max-w-xs">
                      <FormLabel>Default Item Rows</FormLabel>
                      <FormControl>
                          <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />
      </CardContent>
    </Card>
  );
}
