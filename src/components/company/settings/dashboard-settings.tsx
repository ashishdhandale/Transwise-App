
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const settingsSchema = z.object({
  vehicleDocReminderDays: z.coerce
    .number()
    .min(1, 'Must be at least 1 day.')
    .max(90, 'Cannot exceed 90 days.'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const LOCAL_STORAGE_KEY = 'transwise_dashboard_settings';

export function DashboardSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      vehicleDocReminderDays: 30,
    },
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        const result = settingsSchema.safeParse(parsedSettings);
        if (result.success) {
            form.reset(result.data);
        }
      }
    } catch (error) {
        console.error("Failed to load dashboard settings from local storage", error);
    }
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        toast({
            title: 'Settings Saved',
            description: `Dashboard preferences have been updated.`,
        });
    } catch (error) {
        console.error("Failed to save settings to local storage", error);
        toast({
            title: 'Error',
            description: 'Could not save settings. Please try again.',
            variant: 'destructive',
        });
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Dashboard Preferences</CardTitle>
        <CardDescription>Customize the reminders and notifications shown on the main dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
