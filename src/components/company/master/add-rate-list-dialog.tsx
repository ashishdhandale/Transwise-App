

'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import type { RateList, City, Customer, Item, RateOnType } from '@/lib/types';
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

const rateOnOptions: { label: string, value: RateOnType }[] = [
    { label: 'Charge Wt.', value: 'Chg.wt' },
    { label: 'Actual Wt.', value: 'Act.wt' },
    { label: 'Quantity', value: 'Quantity' },
];

const stationRateSchema = z.object({
    fromStation: z.string().min(1),
    toStation: z.string().min(1),
    rate: z.coerce.number().min(0),
    rateOn: z.enum(['Chg.wt', 'Act.wt', 'Quantity']),
});

const itemRateSchema = z.object({
    itemId: z.string().min(1),
    rate: z.coerce.number().min(0),
    rateOn: z.enum(['Chg.wt', 'Act.wt', 'Quantity']),
});

const rateListSchema = z.object({
  name: z.string().min(1, 'Rate list name is required.'),
  isStandard: z.boolean(),
  customerIds: z.array(z.number()),
  stationRates: z.array(stationRateSchema),
  itemRates: z.array(itemRateSchema),
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

export function AddRateListDialog({ isOpen, onOpenChange, onSave, rateList, cities, items, customers }: AddRateListDialogProps) {
    const { toast } = useToast();

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
    const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({ control: form.control, name: "itemRates" });
    
    useEffect(() => {
        if (rateList) {
            form.reset({
                name: rateList.name,
                isStandard: rateList.isStandard || false,
                customerIds: rateList.customerIds || [],
                stationRates: rateList.stationRates || [],
                itemRates: rateList.itemRates || [],
            });
        } else {
            form.reset({
                name: '',
                isStandard: false,
                customerIds: [],
                stationRates: [{ fromStation: '', toStation: '', rate: 0, rateOn: 'Chg.wt' }],
                itemRates: [{ itemId: '', rate: 0, rateOn: 'Chg.wt' }],
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
    const itemOptions = items.map(i => ({ label: i.name, value: i.id.toString() }));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{rateList ? 'Edit Rate List' : 'Add New Rate List'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="flex justify-between items-center">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                    <FormLabel>Rate List Name</FormLabel>
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
                                    <FormItem className="flex flex-col items-center ml-4 mt-6">
                                        <FormLabel>Set as Standard</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <Tabs defaultValue="associations">
                            <TabsList>
                                <TabsTrigger value="associations">Associations</TabsTrigger>
                                <TabsTrigger value="station">Station-wise</TabsTrigger>
                                <TabsTrigger value="item">Item-wise</TabsTrigger>
                            </TabsList>
                            <TabsContent value="associations" className="p-1">
                                <FormField
                                    control={form.control}
                                    name="customerIds"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Associated Customers</FormLabel>
                                                <p className="text-sm text-muted-foreground">Apply this rate list to selected customers. A standard rate list cannot have customer associations.</p>
                                            </div>
                                            <ScrollArea className="h-72 w-full rounded-md border">
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
                            <TabsContent value="station">
                                {stationFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end mb-2">
                                        <FormField control={form.control} name={`stationRates.${index}.fromStation`} render={({ field }) => (
                                            <FormItem><FormLabel>From</FormLabel><Combobox options={cityOptions} {...field} placeholder="From Station..."/></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`stationRates.${index}.toStation`} render={({ field }) => (
                                            <FormItem><FormLabel>To</FormLabel><Combobox options={cityOptions} {...field} placeholder="To Station..."/></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`stationRates.${index}.rate`} render={({ field }) => (
                                            <FormItem><FormLabel>Rate</FormLabel><Input type="number" {...field} /></FormItem>
                                        )} />
                                         <FormField control={form.control} name={`stationRates.${index}.rateOn`} render={({ field }) => (
                                            <FormItem><FormLabel>Rate On</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {rateOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            </FormItem>
                                        )} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStation(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" size="sm" variant="outline" onClick={() => appendStation({fromStation: '', toStation: '', rate: 0, rateOn: 'Chg.wt'})}><PlusCircle className="mr-2 h-4 w-4" />Add Station Rate</Button>
                            </TabsContent>
                             <TabsContent value="item">
                                {itemFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end mb-2">
                                        <FormField control={form.control} name={`itemRates.${index}.itemId`} render={({ field }) => (
                                            <FormItem><FormLabel>Item</FormLabel><Combobox options={itemOptions} {...field} placeholder="Select item..."/></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`itemRates.${index}.rate`} render={({ field }) => (
                                            <FormItem><FormLabel>Rate</FormLabel><Input type="number" {...field} /></FormItem>
                                        )} />
                                         <FormField control={form.control} name={`itemRates.${index}.rateOn`} render={({ field }) => (
                                            <FormItem><FormLabel>Rate On</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {rateOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            </FormItem>
                                        )} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" size="sm" variant="outline" onClick={() => appendItem({itemId: '', rate: 0, rateOn: 'Chg.wt'})}><PlusCircle className="mr-2 h-4 w-4" />Add Item Rate</Button>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="mt-4 pt-4 border-t">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
