
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { ChallanFormatPreview } from './challan-format-preview';
import type { PrintFormat } from './print-format-settings';
import { fieldGroupSchema } from './print-format-settings';
import type { AllCompanySettings } from '@/app/company/settings/actions';


const challanFormatSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Format name must be at least 3 characters.'),
  isDefault: z.boolean(),
  fieldGroups: z.array(fieldGroupSchema),
});

const settingsSchema = z.object({
  formats: z.array(challanFormatSchema),
});

export type ChallanFormat = z.infer<typeof challanFormatSchema>;
type ChallanSettingsFormValues = z.infer<typeof settingsSchema>;

const LOCAL_STORAGE_KEY = 'transwise_challan_formats';

const ALL_FIELDS_CONFIG: z.infer<typeof fieldGroupSchema>[] = [
    { groupLabel: 'Header', fields: [ { id: 'companyName', label: 'Company Name', checked: true }, { id: 'companyAddress', label: 'Company Address', checked: true }, { id: 'companyContact', label: 'Company Contact', checked: true }, { id: 'documentTitle', label: 'Title (e.g., Loading Slip)', checked: true }] },
    { groupLabel: 'Challan Info', fields: [ { id: 'challanNo', label: 'Challan No', checked: true }, { id: 'challanDate', label: 'Challan Date', checked: true }, { id: 'vehicleNo', label: 'Vehicle No', checked: true }, { id: 'driverName', label: 'Driver Name', checked: true }, { id: 'fromStation', label: 'From Station', checked: true }, { id: 'toStation', label: 'To Station', checked: true }] },
    { groupLabel: 'LR Table', fields: [ { id: 'lrTableHeader', label: 'Table Headers', checked: true }, { id: 'lrTableRows', label: 'LR Rows (All)', checked: true }, { id: 'lrTableTotals', label: 'Table Totals', checked: true }] },
    { groupLabel: 'Footer', fields: [ { id: 'remarks', label: 'Remarks/Dispatch Note', checked: true }, { id: 'driverSignature', label: 'Driver Signature Area', checked: true }, { id: 'loadingInchargeSignature', label: 'Loading Incharge Signature', checked: true }] },
];

const createNewFormat = (id: string, name: string, isDefault = false): ChallanFormat => ({
    id,
    name,
    isDefault,
    fieldGroups: JSON.parse(JSON.stringify(ALL_FIELDS_CONFIG)), // Deep copy
});


export function ChallanFormatSettings() {
  const { toast } = useToast();
  // This local form is only for managing the formats internally, not for the main page submission.
  const localForm = useForm<ChallanSettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { formats: [] },
  });

  const { fields: formatFields, append, remove } = useFieldArray({
    control: localForm.control,
    name: 'formats',
  });

  const [activeFormatId, setActiveFormatId] = useState<string | null>(null);
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>(ALL_FIELDS_CONFIG.map(g => g.groupLabel));

  const watchedFormats = localForm.watch('formats');
  const pageForm = useFormContext<AllCompanySettings>();

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.formats && parsed.formats.length > 0) {
          localForm.reset(parsed);
          setActiveFormatId(parsed.formats.find((f: ChallanFormat) => f.isDefault)?.id || parsed.formats[0].id);
        }
      } else {
        const defaultFormat = createNewFormat('default-1', 'Default Challan Format', true);
        localForm.reset({ formats: [defaultFormat] });
        setActiveFormatId(defaultFormat.id);
      }
    } catch (error) {
      console.error("Failed to load challan format settings", error);
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

  const handleSetDefault = (formatId: string) => {
      const currentFormats = localForm.getValues('formats');
      const updatedFormats = currentFormats.map(f => ({ ...f, isDefault: f.id === formatId }));
      localForm.setValue('formats', updatedFormats, { shouldDirty: true });
  }
  
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
        title: 'Challan Formats Saved',
        description: 'Your challan format preferences have been updated locally.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not save challan formats.',
        variant: 'destructive',
      });
    }
  };
  
  const activeFormatData = activeFormatIndex !== -1 ? watchedFormats[activeFormatIndex] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Challan Print Settings</CardTitle>
        <CardDescription>
          Create and customize different challan formats (Loading Slips). Select a default format to be used across the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="mb-6">
            <FormField
                control={pageForm.control}
                name="challanPrefix"
                render={({ field }) => (
                    <FormItem className="max-w-xs">
                        <FormLabel>Challan Prefix</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., CHLN" {...field} />
                        </FormControl>
                        <FormDescription>Prefix for new challan IDs.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <Separator className="my-6" />

        <div className="flex items-start gap-6">
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
                        {watchedFormats[index]?.isDefault && <span className="ml-auto text-xs text-muted-foreground">(Default)</span>}
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" disabled={format.isDefault}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{watchedFormats[index]?.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. You cannot delete the default format.
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

          <div className="flex-1 border-l pl-6">
            {activeFormatIndex !== -1 && activeFormatData ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
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
                    {!activeFormatData.isDefault && (
                        <Button type="button" variant="outline" onClick={() => handleSetDefault(activeFormatData.id)}>Set as Default</Button>
                    )}
                  </div>
                  <Separator />

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
                        Save Formats
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Challan Preview: {activeFormatData.name}</DialogTitle>
                            </DialogHeader>
                             <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
                                <ChallanFormatPreview format={activeFormatData} />
                             </div>
                        </DialogContent>
                    </Dialog>
                  </div>
                </div>
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
