'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const customChargeSchema = z.object({
  name: z.string().min(1, 'Charge name is required.'),
  value: z.coerce.number().min(0, 'Value must be a positive number.'),
});

const settingsSchema = z.object({
  builtyCharge: z.coerce.number().min(0, 'Value must be a positive number.'),
  loadingLabourCharge: z.coerce.number().min(0, 'Value must be a positive number.'),
  customCharges: z.array(customChargeSchema).optional(),
});

export type AdditionalChargesSettingsValues = z.infer<typeof settingsSchema>;

const LOCAL_STORAGE_KEY = 'transwise_additional_charges_settings';

export function AdditionalChargesSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdditionalChargesSettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      builtyCharge: 0,
      loadingLabourCharge: 0,
      customCharges: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customCharges',
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
      console.error("Failed to load additional charges settings from local storage", error);
    }
  }, [form]);

  const onSubmit = async (data: AdditionalChargesSettingsValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: 'Settings Saved',
        description: 'Additional charges preferences have been updated.',
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
        <CardTitle className="font-headline">Additional Charges Preferences</CardTitle>
        <CardDescription>Set default values for charges on the booking form.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="builtyCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Builty Charge</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loadingLabourCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Loading Labour Charge</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium">Custom Charges</h3>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`customCharges.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Charge Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Handling Fee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`customCharges.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Default Value</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                        <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ name: '', value: 0 })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Custom Charge
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Charges
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
