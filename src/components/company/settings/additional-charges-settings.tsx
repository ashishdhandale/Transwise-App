
'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Trash2, GripVertical } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AllCompanySettings } from '@/app/company/settings/actions';

const calculationTypes = [
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'per_kg_actual', label: 'Per Kg (Actual Wt.)' },
    { value: 'per_kg_charge', label: 'Per Kg (Charge Wt.)' },
    { value: 'per_quantity', label: 'Per Quantity' },
];

export const chargeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Charge name is required.'),
  calculationType: z.enum(['fixed', 'per_kg_actual', 'per_kg_charge', 'per_quantity']),
  value: z.coerce.number().min(0, 'Value must be a positive number.').optional().default(0),
  isVisible: z.boolean(),
  isEditable: z.boolean(),
  isCustom: z.boolean(),
});

export type ChargeSetting = z.infer<typeof chargeSchema>;

export function AdditionalChargesSettings() {
  const form = useFormContext<AllCompanySettings>();

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'additionalCharges',
  });
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
        <CardDescription>Drag to reorder, set defaults, and control which charges are visible and how they behave on the booking form.</CardDescription>
      </CardHeader>
      <CardContent>
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
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField
                        control={form.control}
                        name={`additionalCharges.${index}.name`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Charge Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Handling Fee" {...field} disabled={!form.getValues(`additionalCharges.${index}.isCustom`)} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                          control={form.control}
                          name={`additionalCharges.${index}.calculationType`}
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Default Calculation</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder="Select a type" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          {calculationTypes.map(type => (
                                              <SelectItem key={type.value} value={type.value}>
                                                  {type.label}
                                              </SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                    <FormField
                        control={form.control}
                        name={`additionalCharges.${index}.value`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Default Value/Rate</FormLabel>
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
                        name={`additionalCharges.${index}.isVisible`}
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
                    <FormField
                        control={form.control}
                        name={`additionalCharges.${index}.isEditable`}
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center gap-2">
                                <FormLabel>Dynamic</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        aria-label="Toggle dynamic calculation"
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
                onClick={() => append({ id: `custom-${Date.now()}`, name: '', value: 0, calculationType: 'fixed', isVisible: true, isEditable: true, isCustom: true })}
                >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Custom Charge
            </Button>
          </div>
      </CardContent>
    </Card>
  );
}