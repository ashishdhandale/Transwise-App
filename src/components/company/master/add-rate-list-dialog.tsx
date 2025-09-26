

'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { RateList, City, Customer, Item, RateOnType, ChargeValue } from '@/lib/types';
import { Trash2, PlusCircle } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ChargeSetting } from '../settings/additional-charges-settings';

const rateOnOptions: { label: string; value: RateOnType }[] = [
    { label: 'Charge Wt.', value: 'Chg.wt' },
    { label: 'Actual Wt.', value: 'Act.wt' },
    { label: 'Quantity', value: 'Quantity' },
    { label: 'Fixed', value: 'Fixed' },
];

const chargeValueSchema = z.object({
    rate: z.coerce.number().min(0),
    rateOn: z.enum(['Chg.wt', 'Act.wt', 'Quantity', 'Fixed']),
}).optional();

const stationRateSchema = z.object({
    fromStation: z.string().min(1),
    toStation: z.string().min(1),
    charges: z.object({
        baseRate: z.object({
            rate: z.coerce.number().min(0),
            rateOn: z.enum(['Chg.wt', 'Act.wt', 'Quantity', 'Fixed']),
        }),
        // Dynamically add other charges
    }).catchall(chargeValueSchema),
});

const rateListSchema = z.object({
  name: z.string().min(1, 'Rate list name is required.'),
  isStandard: z.boolean(),
  customerIds: z.array(z.number()),
  stationRates: z.array(stationRateSchema),
  itemRates: z.array(z.any()), // Keep itemRates simple for now
});

type RateListFormValues = z.infer<typeof rateListSchema>;

interface AddRateListDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (rateListData: Omit<RateList, 'id'>, isStandard: boolean) => boolean;
    rateList?: RateList | null;
    cities: City[];
    items: Item[];
    customers: Customer[];
}

const LOCAL_STORAGE_KEY_CHARGES = 'transwise_additional_charges_settings';

export function AddRateListDialog({ isOpen, onOpenChange, onSave, rateList, cities, items, customers }: AddRateListDialogProps) {
    const { toast } = useToast();
    const [chargeSettings, setChargeSettings] = useState<ChargeSetting[]>([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CHARGES);
            if (saved) {
                const parsed = JSON.parse(saved);
                setChargeSettings(parsed.charges || []);
            }
        } catch (error) { console.error("Could not load charge settings"); }
    }, [isOpen]);

    const form = useForm<RateListFormValues>({
        resolver: zodResolver(rateListSchema),
        defaultValues: {
            name: '',
            isStandard: false,
            customerIds: [],
            stationRates: [],
            itemRates: [],
        },
    });
    
    const { fields: stationFields, append: appendStation, remove: removeStation } = useFieldArray({ control: form.control, name: "stationRates" });
    
    useEffect(() => {
        if (rateList) {
            form.reset({
                name: rateList.name,
                isStandard: rateList.isStandard || false,
                customerIds: rateList.customerIds || [],
                stationRates: rateList.stationRates.map(sr => ({ ...sr, charges: sr.charges || { baseRate: { rate: 0, rateOn: 'Chg.wt'}} })) || [],
                itemRates: rateList.itemRates || [],
            });
        } else {
            form.reset({
                name: '',
                isStandard: false,
                customerIds: [],
                stationRates: [],
                itemRates: [],
            });
        }
    }, [rateList, isOpen, form]);


    const handleSave = (data: RateListFormValues) => {
        const success = onSave(data, data.isStandard);
        if (success) {
            onOpenChange(false);
        }
    };

    const cityOptions = cities.map(c => ({ label: c.name, value: c.name }));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>{rateList ? 'Edit Rate List' : 'Add New Quotation'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="py-4 space-y-4 max-h-[80vh] pr-4">
                        {/* Header Section */}
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-center border-b pb-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Quotation / Rate List Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} autoFocus />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isStandard"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 pt-6">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                id="isStandard"
                                            />
                                        </FormControl>
                                        <FormLabel htmlFor="isStandard">Set as Standard Rate</FormLabel>
                                    </FormItem>
                                )}
                            />
                             <div className="pt-6">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" className="ml-2">Save</Button>
                            </div>
                        </div>

                        {/* Body / Tabs Section */}
                         <Tabs defaultValue="rates">
                            <TabsList>
                                <TabsTrigger value="rates">Station Rates</TabsTrigger>
                                <TabsTrigger value="associations">Customer Associations</TabsTrigger>
                            </TabsList>
                            <TabsContent value="associations" className="p-1">
                                <FormField
                                    control={form.control}
                                    name="customerIds"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Associated Customers</FormLabel>
                                                <p className="text-sm text-muted-foreground">Apply this quotation to selected customers. A standard rate list cannot have associations.</p>
                                            </div>
                                            <ScrollArea className="h-72 w-1/2 rounded-md border">
                                                <div className="p-4">
                                                {customers.map((customer) => (
                                                    <FormField
                                                        key={customer.id}
                                                        control={form.control}
                                                        name="customerIds"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem key={customer.id} className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(customer.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...(field.value || []), customer.id])
                                                                                    : field.onChange(field.value?.filter((value) => value !== customer.id));
                                                                            }}
                                                                            disabled={form.getValues('isStandard')}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">{customer.name}</FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                                </div>
                                            </ScrollArea>
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                            <TabsContent value="rates">
                                {/* Table Header */}
                                <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-2 pb-2 border-b">
                                    <Label>From</Label>
                                    <Label>To</Label>
                                    <Label className="text-center">Base Rate</Label>
                                    {chargeSettings.filter(cs => cs.id !== 'othersCharge' && cs.isVisible).map(cs => <Label key={cs.id} className="text-center">{cs.name}</Label>)}
                                </div>
                                {/* Table Rows */}
                                <ScrollArea className="h-[45vh]">
                                    <div className="space-y-2 p-1">
                                    {stationFields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 items-start">
                                            <FormField control={form.control} name={`stationRates.${index}.fromStation`} render={({ field }) => (
                                                <Combobox options={cityOptions} {...field} placeholder="From..."/>
                                            )} />
                                            <FormField control={form.control} name={`stationRates.${index}.toStation`} render={({ field }) => (
                                                <Combobox options={cityOptions} {...field} placeholder="To..."/>
                                            )} />
                                            
                                            {/* Base Rate */}
                                            <div className="flex flex-col gap-1">
                                                <FormField control={form.control} name={`stationRates.${index}.charges.baseRate.rate`} render={({ field }) => (
                                                   <Input type="number" placeholder="Rate" {...field} />
                                                )} />
                                                <FormField control={form.control} name={`stationRates.${index}.charges.baseRate.rateOn`} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="Chg.wt">Chg.wt</SelectItem><SelectItem value="Act.wt">Act.wt</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>

                                            {/* Dynamic Additional Charges */}
                                            {chargeSettings.filter(cs => cs.id !== 'othersCharge' && cs.isVisible).map(chargeSetting => (
                                                 <div key={chargeSetting.id} className="flex flex-col gap-1">
                                                    <FormField control={form.control} name={`stationRates.${index}.charges.${chargeSetting.id}.rate`} render={({ field }) => (
                                                        <Input type="number" placeholder="Rate" {...field} />
                                                    )} />
                                                    <FormField control={form.control} name={`stationRates.${index}.charges.${chargeSetting.id}.rateOn`} render={({ field }) => (
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {rateOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                                </div>
                                            ))}

                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeStation(index)} className="mt-4"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    ))}
                                     <Button type="button" size="sm" variant="outline" onClick={() => {
                                        const newStationRate: any = {fromStation: '', toStation: '', charges: { baseRate: { rate: 0, rateOn: 'Chg.wt' }}};
                                        chargeSettings.forEach(cs => {
                                            newStationRate.charges[cs.id] = { rate: 0, rateOn: cs.calculationType === 'fixed' ? 'Fixed' : 'Chg.wt' };
                                        });
                                        appendStation(newStationRate);
                                     }}><PlusCircle className="mr-2 h-4 w-4" />Add Row</Button>
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
