
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PrintFormatPreview } from './print-format-preview';

// --- SCHEMA DEFINITIONS ---
const fieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  checked: z.boolean(),
});

export const fieldGroupSchema = z.object({
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

export type PrintFormat = z.infer<typeof printFormatSchema>;
export type SettingsFormValues = z.infer<typeof settingsSchema>;

// --- CONSTANTS ---
const LOCAL_STORAGE_KEY = 'transwise_print_formats';

const ALL_FIELDS_CONFIG: z.infer<typeof fieldGroupSchema>[] = [
    { groupLabel: 'Header', fields: [ { id: 'companyName', label: 'Company Name', checked: true }, { id: 'companyAddress', label: 'Company Address', checked: true }, { id: 'companyContact', label: 'Company Contact', checked: true }, { id: 'companyGstin', label: 'Company GSTIN', checked: true }, { id: 'grNote', label: 'GR / CN Note', checked: true }, { id: 'copyType', label: 'Copy Type (e.g., Sender)', checked: true }] },
    { groupLabel: 'Booking Info', fields: [ { id: 'grNo', label: 'GR Number', checked: true }, { id: 'grDate', label: 'GR Date', checked: true }, { id: 'fromStation', label: 'From Station', checked: true }, { id: 'toStation', label: 'To Station', checked: true }] },
    { groupLabel: 'Parties', fields: [ { id: 'consignorName', label: 'Consignor Name', checked: true }, { id: 'consignorAddress', label: 'Consignor Address', checked: false }, { id: 'consignorGstin', label: 'Consignor GSTIN', checked: false }, { id: 'consignorMobile', label: 'Consignor Mobile', checked: false }, { id: 'consigneeName', label: 'Consignee Name', checked: true }, { id: 'consigneeAddress', label: 'Consignee Address', checked: false }, { id: 'consigneeGstin', label: 'Consignee GSTIN', checked: false }, { id: 'consigneeMobile', label: 'Consignee Mobile', checked: false } ] },
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
  const [activeFormatId, setActiveFormatId] = useState<string | null>(null);
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>(ALL_FIELDS_CONFIG.map(g => g.groupLabel));

  const { toast } = useToast();

  const localForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      formats: [],
    },
  });

  const { fields: formatFields, append, remove } = useFieldArray({
    control: localForm.control,
    name: 'formats',
  });

  const watchedFormats = localForm.watch('formats');

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.formats && parsed.formats.length > 0) {
          localForm.reset(parsed);
          setActiveFormatId(parsed.formats[0].id);
        }
      } else {
         const defaultFormat = createNewFormat('default-1', 'Standard Print');
         localForm.reset({ formats: [defaultFormat] });
         setActiveFormatId(defaultFormat.id);
      }
    } catch (error) {
      console.error("Failed to load print format settings", error);
    }
  }, [localForm]);

  const activeFormatIndex = activeFormatId ? formatFields.findIndex(f => f.id === activeFormatId) : -1;

  const handleAddNewFormat = () => {
    const newId = `format-${Date.now()}`;
    const newName = `New Format ${formatFields.length + 1}`;
    const newFormat = createNewFormat(newId, newName);
    append(newFormat);
    setActiveFormatId(newId);
  };

  const handleRemoveFormat = (index: number) => {
    const formatToRemoveId = formatFields[index].id;
    remove(index);
    
    if(activeFormatId === formatToRemoveId) {
        const remainingFormats = localForm.getValues('formats');
        if (remainingFormats.length > 0) {
            setActiveFormatId(remainingFormats[0].id);
        } else {
            setActiveFormatId(null);
        }
    }
    toast({ title: 'Format Deleted', variant: 'destructive'});
  };
  
  const toggleCollapsible = (groupLabel: string) => {
    setOpenCollapsibles(prev => 
        prev.includes(groupLabel) ? prev.filter(g => g !== groupLabel) : [...prev, groupLabel]
    );
  };
  
  const handleSaveFormats = () => {
    const data = localForm.getValues();
     try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: 'Print Formats Saved',
        description: 'Your print format preferences have been updated locally.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not save print formats.',
        variant: 'destructive',
      });
    }
  };
  
  const activeFormatData = activeFormatIndex !== -1 ? watchedFormats[activeFormatIndex] : null;

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
                <div key={format.id} className="flex items-center gap-1 group">
                    <Button 
                        variant={activeFormatId === format.id ? 'secondary' : 'ghost'} 
                        className="flex-1 justify-start"
                        onClick={() => setActiveFormatId(format.id)}
                    >
                        {watchedFormats[index]?.name || 'Untitled Format'}
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{watchedFormats[index]?.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this print format.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveFormat(index)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ))}
             <Button variant="outline" size="sm" onClick={handleAddNewFormat}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Format
            </Button>
          </div>

          {/* Form Editor */}
          <div className="flex-1 border-l pl-6">
            {activeFormatIndex !== -1 && activeFormatData ? (
              <FormProvider {...localForm}>
                <div className="space-y-6">
                  {/* Format Name */}
                  <FormField
                    control={localForm.control}
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
                     {localForm.getValues(`formats.${activeFormatIndex}.fieldGroups`).map((group, groupIndex) => (
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
                                        control={localForm.control}
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
                                                    {localForm.getValues(`formats.${activeFormatIndex}.fieldGroups.${groupIndex}.fields.${fieldIndex}.label`)}
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

                  <div className="flex items-center gap-4">
                    <Button type="button" onClick={handleSaveFormats}>
                        Save All Formats
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Print Preview: {activeFormatData.name}</DialogTitle>
                            </DialogHeader>
                             <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
                                <PrintFormatPreview format={activeFormatData} />
                             </div>
                        </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </FormProvider>
            ) : (
                <div className="text-center text-muted-foreground p-8 h-96 flex items-center justify-center border-dashed border-2 rounded-md">
                    <p>Select a format to edit, or add a new one to begin.</p>
                </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
