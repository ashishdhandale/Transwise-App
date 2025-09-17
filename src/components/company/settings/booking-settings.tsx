'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  defaultItemRows: z.coerce
    .number()
    .min(1, 'Must have at least 1 row.')
    .max(10, 'Cannot exceed 10 rows.'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const LOCAL_STORAGE_KEY = 'transwise_booking_settings';

export function BookingSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      defaultItemRows: 2,
    },
  });

  useEffect(() => {
    // Load saved settings from local storage when the component mounts
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Validate parsed settings against schema
        const result = settingsSchema.safeParse(parsedSettings);
        if (result.success) {
            form.reset(result.data);
        }
      }
    } catch (error) {
        console.error("Failed to load settings from local storage", error);
    }
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        // Save settings to local storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        toast({
            title: 'Settings Saved',
            description: `Default booking rows set to ${data.defaultItemRows}.`,
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
        <CardTitle className="font-headline">Booking Form Preferences</CardTitle>
        <CardDescription>Customize the default behavior of the new booking page.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
