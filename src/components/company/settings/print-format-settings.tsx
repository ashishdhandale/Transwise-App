
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// --- SCHEMA DEFINITIONS ---
const fieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  checked: z.boolean(),
});

const fieldGroupSchema = z.object({
  groupLabel: z.string(),
  fields: z.array(fieldSchema),
});

const printFormatSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Format name must be at least 3 characters.'),
  fieldGroups: z.array(fieldGroupSchema),
});

const settingsSchema = z.object({
  formats: z.array(printFormatSchema),
});

type PrintFormat = z.infer<typeof printFormatSchema>;
type SettingsFormValues = z.infer<typeof settingsSchema>;

// --- CONSTANTS ---
const LOCAL_STORAGE_KEY = 'transwise_print_formats';

const ALL_FIELDS_CONFIG: z.infer<typeof fieldGroupSchema>[] = [
    { groupLabel: 'Header', fields: [ { id: 'companyName', label: 'Company Name', checked: true }, { id: 'companyAddress', label: 'Company Address', checked: true }, { id: 'companyContact', label: 'Company Contact', checked: true }, { id: 'companyGstin', label: 'Company GSTIN', checked: true }, { id: 'grNote', label: 'GR / CN Note', checked: true }, { id: 'copyType', label: 'Copy Type (e.g., Sender)', checked: true }] },
    { groupLabel: 'Booking Info', fields: [ { id: 'grNo', label: 'GR Number', checked: true }, { id: 'grDate', label: 'GR Date', checked: true }, { id: 'fromStation', label: 'From Station', checked: true }, { id: 'toStation', label: 'To Station', checked: true }] },
    { groupLabel: 'Parties', fields: [ { id: 'consignorName', label: 'Consignor Name', checked: true }, { id: 'consignorAddress', label: 'Consignor Address', checked: false }, { id: 'consigneeName', label: 'Consignee Name', checked: true }, { id: 'consigneeAddress', label: 'Consignee Address', checked: false }] },
    { groupLabel: 'Vehicle (FTL)', fields: [ { id: 'ftlVehicleNo', label: 'Vehicle No', checked: true }, { id: 'ftlDriver', label: 'Driver', checked: true }, { id: 'ftlSupplier', label: 'Lorry Supplier', checked: true }, { id: 'ftlTruckFreight', label: 'Truck Freight', checked: true }, { id: 'ftlAdvance', label: 'Advance Paid', checked: true }, { id: 'ftlBalance', label: 'Balance Freight', checked: true }] },
    { groupLabel: 'Item Table', fields: [ { id: 'itemTableHeader', label: 'Table Headers', checked: true }, { id: 'itemTableRows', label: 'Item Rows (All)', checked: true }, { id: 'itemTableTotals', label: 'Table Totals', checked: true }] },
    { groupLabel: 'Charges & Footer', fields: [ { id: 'termsConditions', label: 'Terms & Conditions', checked: true }, { id: 'chargesSummary', label: 'Charges Box (All)', checked: true }, { id: 'grandTotal', label: 'Grand Total', checked: true }, { id: 'receiverSignature', label: 'Receiver Signature Area', checked: true }, { id: 'authorisedSignature', label: 'Authorised Signature Area', checked: true }] },
];

const createNewFormat = (id: string, name: string): PrintFormat => ({
    id,
    name,
    fieldGroups: JSON.parse(JSON.stringify(ALL_FIELDS_CONFIG)), // Deep copy
});

// --- COMPONENT ---
export function PrintFormatSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFormatId, setActiveFormatId] = useState<string | null>(null);
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>(ALL_FIELDS_CONFIG.map(g => g.groupLabel));

  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      formats: [],
    },
  });

  const { fields: formatFields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'formats',
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.formats && parsed.formats.length > 0) {
          form.reset(parsed);
          setActiveFormatId(parsed.formats[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load print format settings", error);
    }
  }, [form]);

  const activeFormatIndex = activeFormatId ? formatFields.findIndex(f => f.id === activeFormatId) : -1;

  const handleAddNewFormat = () => {
    const newId = `format-${Date.now()}`;
    const newName = `New Format ${formatFields.length + 1}`;
    const newFormat = createNewFormat(newId, newName);
    append(newFormat);
    setActiveFormatId(newId);
  };

  const handleRemoveFormat = (index: number) => {
    remove(index);
    if (formatFields.length > 1) {
        setActiveFormatId(formatFields[index - 1]?.id || formatFields[0]?.id);
    } else {
        setActiveFormatId(null);
    }
  };
  
  const toggleCollapsible = (groupLabel: string) => {
    setOpenCollapsibles(prev => 
        prev.includes(groupLabel) ? prev.filter(g => g !== groupLabel) : [...prev, groupLabel]
    );
  };
  
  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: 'Settings Saved',
        description: 'Your print format preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not save settings.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Print Format Settings</CardTitle>
        <CardDescription>
          Create and customize different receipt formats by selecting which fields to print. 
          These formats will appear in the "Print" dropdown on the booking page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          {/* Format List */}
          <div className="w-1/4 space-y-2">
             <h3 className="font-semibold px-1">My Formats</h3>
            {formatFields.map((format, index) => (
                <div key={format.id} className="flex items-center gap-1">
                    <Button 
                        variant={activeFormatId === format.id ? 'secondary' : 'ghost'} 
                        className="flex-1 justify-start"
                        onClick={() => setActiveFormatId(format.id)}
                    >
                        {format.name}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveFormat(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
             <Button variant="outline" size="sm" onClick={handleAddNewFormat}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Format
            </Button>
          </div>

          {/* Form Editor */}
          <div className="flex-1 border-l pl-6">
            {activeFormatIndex !== -1 ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Format Name */}
                  <FormField
                    control={form.control}
                    name={`formats.${activeFormatIndex}.name`}
                    render={({ field }) => (
                      <FormItem className="max-w-sm">
                        <FormLabel className="font-bold text-lg">Format Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />

                  {/* Field Selection */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Printable Fields</h3>
                     {form.getValues(`formats.${activeFormatIndex}.fieldGroups`).map((group, groupIndex) => (
                       <Collapsible key={group.groupLabel} open={openCollapsibles.includes(group.groupLabel)} onOpenChange={() => toggleCollapsible(group.groupLabel)} className="space-y-2">
                            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-muted px-3 py-2 text-sm font-medium">
                                {group.groupLabel}
                                {openCollapsibles.includes(group.groupLabel) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 p-4 border rounded-md">
                                {group.fields.map((field, fieldIndex) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`formats.${activeFormatIndex}.fieldGroups.${groupIndex}.fields.${fieldIndex}.checked`}
                                        render={({ field: checkboxField }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={checkboxField.value}
                                                        onCheckedChange={checkboxField.onChange}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {form.getValues(`formats.${activeFormatIndex}.fieldGroups.${groupIndex}.fields.${fieldIndex}.label`)}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                  </div>

                  <Separator />

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save All Formats
                  </Button>
                </form>
              </Form>
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    <p>Select a format to edit, or add a new one.</p>
                </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
