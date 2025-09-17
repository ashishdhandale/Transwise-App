'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const chargeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Charge name is required.'),
  value: z.coerce.number().min(0, 'Value must be a positive number.'),
  isVisible: z.boolean(),
  isCustom: z.boolean(),
});

const settingsSchema = z.object({
  charges: z.array(chargeSchema),
});

export type AdditionalChargesSettingsValues = z.infer<typeof settingsSchema>;
export type ChargeSetting = z.infer<typeof chargeSchema>;

const LOCAL_STORAGE_KEY = 'transwise_additional_charges_settings';

const defaultCharges: ChargeSetting[] = [
    { id: 'builtyCharge', name: 'Builty Charge', value: 0, isVisible: true, isCustom: false },
    { id: 'doorDelivery', name: 'Door Delivery', value: 0, isVisible: true, isCustom: false },
    { id: 'collectionCharge', name: 'Collection Charge', value: 0, isVisible: true, isCustom: false },
    { id: 'loadingLabourCharge', name: 'Loading Labour Charge', value: 0, isVisible: true, isCustom: false },
    { id: 'pfCharge', name: 'P.F. Charge', value: 0, isVisible: true, isCustom: false },
    { id: 'othersCharge', name: 'Others Charge', value: 0, isVisible: true, isCustom: false },
];


export function AdditionalChargesSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdditionalChargesSettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      charges: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'charges',
  });
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        const result = settingsSchema.safeParse(parsedSettings);
        if (result.success && result.data.charges.length > 0) {
          form.reset(result.data);
        } else {
          form.reset({ charges: defaultCharges });
        }
      } else {
         form.reset({ charges: defaultCharges });
      }
    } catch (error) {
      console.error("Failed to load settings", error);
      form.reset({ charges: defaultCharges });
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
      console.error("Failed to save settings", error);
      toast({
        title: 'Error',
        description: 'Could not save settings. Please try again.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    move(draggedIndex, index);
    setDraggedIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Additional Charges Preferences</CardTitle>
        <CardDescription>Drag to reorder, toggle visibility, and set default values for charges on the booking form.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="flex items-center gap-2 p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                   <Button type="button" variant="ghost" size="icon" className="cursor-grab p-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <FormField
                          control={form.control}
                          name={`charges.${index}.name`}
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Charge Name</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g., Handling Fee" {...field} disabled={!form.getValues(`charges.${index}.isCustom`)} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name={`charges.${index}.value`}
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Default Value</FormLabel>
                              <FormControl>
                                  <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                      <FormField
                          control={form.control}
                          name={`charges.${index}.isVisible`}
                          render={({ field }) => (
                              <FormItem className="flex flex-col items-center gap-2">
                                  <FormLabel>Visible</FormLabel>
                                  <FormControl>
                                      <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          aria-label="Toggle charge visibility"
                                      />
                                  </FormControl>
                              </FormItem>
                          )}
                      />
                      {field.isCustom && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                  </div>
                </div>
              ))}
              <Separator />
               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ id: `custom-${Date.now()}`, name: '', value: 0, isVisible: true, isCustom: true })}
                  >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Custom Charge
              </Button>
            </div>
            
            <Separator />

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
