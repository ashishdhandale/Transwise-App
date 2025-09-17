
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, GripVertical } from 'lucide-react';
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

const columnSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required.'),
  isVisible: z.boolean(),
  isCustom: z.boolean(),
  isRemovable: z.boolean(),
  width: z.string().optional(),
});

const settingsSchema = z.object({
  columns: z.array(columnSchema),
});

export type ItemDetailsSettingsValues = z.infer<typeof settingsSchema>;
export type ColumnSetting = z.infer<typeof columnSchema>;

const LOCAL_STORAGE_KEY = 'transwise_item_details_settings';

const defaultColumns: ColumnSetting[] = [
    { id: 'ewbNo', label: 'EWB no.', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[220px]' },
    { id: 'itemName', label: 'Item Name*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[160px]' },
    { id: 'description', label: 'Description*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[220px]' },
    { id: 'qty', label: 'Qty*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
    { id: 'actWt', label: 'Act.wt*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
    { id: 'chgWt', label: 'Chg.wt*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
    { id: 'rate', label: 'Rate', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
    { id: 'freightOn', label: 'Freight ON', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[130px]' },
    { id: 'lumpsum', label: 'Lumpsum', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[120px]' },
    { id: 'pvtMark', label: 'Pvt.Mark', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
    { id: 'invoiceNo', label: 'Invoice No', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
    { id: 'dValue', label: 'D.Value', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
];


export function ItemDetailsSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ItemDetailsSettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { columns: [] },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'columns',
  });
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.columns) {
          // Merge saved with default to ensure all columns are present
          const savedCustom = parsed.columns.filter((c: ColumnSetting) => c.isCustom);
          const mergedColumns = defaultColumns.map(dc => parsed.columns.find((sc: ColumnSetting) => sc.id === dc.id) || dc);
          form.reset({ columns: [...mergedColumns, ...savedCustom] });
        } else {
            form.reset({ columns: defaultColumns });
        }
      } else {
         form.reset({ columns: defaultColumns });
      }
    } catch (error) {
      console.error("Failed to load item details settings", error);
      form.reset({ columns: defaultColumns });
    }
  }, [form]);

  const onSubmit = async (data: ItemDetailsSettingsValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: 'Settings Saved',
        description: 'Item table preferences have been updated.',
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
        <CardTitle className="font-headline">Item Table Preferences</CardTitle>
        <CardDescription>Drag to reorder, toggle visibility, and add custom columns to the item details table on the booking form.</CardDescription>
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
                          name={`columns.${index}.label`}
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Column Label</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g., Batch No." {...field} disabled={!form.getValues(`columns.${index}.isCustom`)} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                       <FormField
                          control={form.control}
                          name={`columns.${index}.width`}
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Column Width</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g., w-[150px]" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                      <FormField
                          control={form.control}
                          name={`columns.${index}.isVisible`}
                          render={({ field }) => (
                              <FormItem className="flex flex-col items-center gap-2">
                                  <FormLabel>Visible</FormLabel>
                                  <FormControl>
                                      <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                      />
                                  </FormControl>
                              </FormItem>
                          )}
                      />
                      {field.isRemovable && (
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
                  onClick={() => {
                    const newId = `custom-${Date.now()}`;
                    append({ 
                        id: newId, 
                        label: '', 
                        isVisible: true, 
                        isCustom: true,
                        isRemovable: true,
                        width: 'w-[150px]' 
                    });
                  }}
                  >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Custom Column
              </Button>
            </div>
            
            <Separator />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Table Preferences
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


