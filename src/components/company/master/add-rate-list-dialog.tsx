

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
import type { RateList, City, VehicleMaster, Customer, Item } from '@/lib/types';
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

const stationRateSchema = z.object({
    fromStation: z.string().min(1),
    toStation: z.string().min(1),
    rate: z.coerce.number().min(0),
});

const itemRateSchema = z.object({
    itemId: z.string().min(1),
    rate: z.coerce.number().min(0),
});

const kmRateSchema = z.object({
    fromKm: z.coerce.number().min(0),
    toKm: z.coerce.number().min(0),
    ratePerKm: z.coerce.number().min(0),
});

const truckRateSchema = z.object({
    truckType: z.string().min(1),
    rate: z.coerce.number().min(0),
});

const rateListSchema = z.object({
  name: z.string().min(1, 'Rate list name is required.'),
  customerIds: z.array(z.number()),
  stationRates: z.array(stationRateSchema),
  itemRates: z.array(itemRateSchema),
  kmRates: z.array(kmRateSchema),
  truckRates: z.array(truckRateSchema),
});

type RateListFormValues = z.infer<typeof rateListSchema>;

interface AddRateListDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (rateListData: Omit<RateList, 'id'>) => boolean;
    rateList?: RateList | null;
    cities: City[];
    vehicles: VehicleMaster[];
    items: Item[];
    customers: Customer[];
}

export function AddRateListDialog({ isOpen, onOpenChange, onSave, rateList, cities, vehicles, items, customers }: AddRateListDialogProps) {
    const { toast } = useToast();

    const form = useForm<RateListFormValues>({
        resolver: zodResolver(rateListSchema),
        defaultValues: {
            name: '',
            customerIds: [],
            stationRates: [],
            itemRates: [],
            kmRates: [],
            truckRates: [],
        },
    });
    
    const { fields: stationFields, append: appendStation, remove: removeStation } = useFieldArray({ control: form.control, name: "stationRates" });
    const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({ control: form.control, name: "itemRates" });
    const { fields: kmFields, append: appendKm, remove: removeKm } = useFieldArray({ control: form.control, name: "kmRates" });
    const { fields: truckFields, append: appendTruck, remove: removeTruck } = useFieldArray({ control: form.control, name: "truckRates" });
    
    useEffect(() => {
        if (rateList) {
            form.reset({
                name: rateList.name,
                customerIds: rateList.customerIds || [],
                stationRates: rateList.stationRates || [],
                itemRates: rateList.itemRates || [],
                kmRates: rateList.kmRates || [],
                truckRates: rateList.truckRates || [],
            });
        } else {
            form.reset({
                name: '',
                customerIds: [],
                stationRates: [{ fromStation: '', toStation: '', rate: 0 }],
                itemRates: [{ itemId: '', rate: 0 }],
                kmRates: [{ fromKm: 0, toKm: 0, ratePerKm: 0 }],
                truckRates: [{ truckType: '', rate: 0 }],
            });
        }
    }, [rateList, isOpen, form]);


    const handleSave = (data: RateListFormValues) => {
        const success = onSave(data);
        if (success) {
            onOpenChange(false);
        }
    };

    const cityOptions = cities.map(c => ({ label: c.name, value: c.name }));
    const vehicleTypeOptions = [...new Set(vehicles.map(v => v.vehicleType))].map(vt => ({ label: vt, value: vt }));
    const itemOptions = items.map(i => ({ label: i.name, value: i.id.toString() }));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{rateList ? 'Edit Rate List' : 'Add New Rate List'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Rate List Name</FormLabel>
                                <FormControl>
                                    <Input {...field} autoFocus />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Tabs defaultValue="associations">
                            <TabsList>
                                <TabsTrigger value="associations">Associations</TabsTrigger>
                                <TabsTrigger value="station">Station-wise</TabsTrigger>
                                <TabsTrigger value="item">Item-wise</TabsTrigger>
                                <TabsTrigger value="km">KM-wise</TabsTrigger>
                                <TabsTrigger value="truck">Truck-wise</TabsTrigger>
                            </TabsList>
                            <TabsContent value="associations" className="p-1">
                                <FormField
                                    control={form.control}
                                    name="customerIds"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Associated Customers</FormLabel>
                                                <p className="text-sm text-muted-foreground">Apply this rate list to selected customers.</p>
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
                                    <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end mb-2">
                                        <FormField control={form.control} name={`stationRates.${index}.fromStation`} render={({ field }) => (
                                            <FormItem><FormLabel>From</FormLabel><Combobox options={cityOptions} {...field} placeholder="From Station..."/></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`stationRates.${index}.toStation`} render={({ field }) => (
                                            <FormItem><FormLabel>To</FormLabel><Combobox options={cityOptions} {...field} placeholder="To Station..."/></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`stationRates.${index}.rate`} render={({ field }) => (
                                            <FormItem><FormLabel>Rate</FormLabel><Input type="number" {...field} /></FormItem>
                                        )} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStation(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" size="sm" variant="outline" onClick={() => appendStation({fromStation: '', toStation: '', rate: 0})}><PlusCircle className="mr-2 h-4 w-4" />Add Station Rate</Button>
                            </TabsContent>
                             <TabsContent value="item">
                                {itemFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[2fr_1fr_auto] gap-2 items-end mb-2">
                                        <FormField control={form.control} name={`itemRates.${index}.itemId`} render={({ field }) => (
                                            <FormItem><FormLabel>Item</FormLabel><Combobox options={itemOptions} {...field} placeholder="Select item..."/></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`itemRates.${index}.rate`} render={({ field }) => (
                                            <FormItem><FormLabel>Rate</FormLabel><Input type="number" {...field} /></FormItem>
                                        )} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" size="sm" variant="outline" onClick={() => appendItem({itemId: '', rate: 0})}><PlusCircle className="mr-2 h-4 w-4" />Add Item Rate</Button>
                            </TabsContent>
                             <TabsContent value="km">
                                {kmFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end mb-2">
                                        <FormField control={form.control} name={`kmRates.${index}.fromKm`} render={({ field }) => (
                                            <FormItem><FormLabel>From (Km)</FormLabel><Input type="number" {...field} /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`kmRates.${index}.toKm`} render={({ field }) => (
                                            <FormItem><FormLabel>To (Km)</FormLabel><Input type="number" {...field} /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`kmRates.${index}.ratePerKm`} render={({ field }) => (
                                            <FormItem><FormLabel>Rate/Km</FormLabel><Input type="number" {...field} /></FormItem>
                                        )} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeKm(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" size="sm" variant="outline" onClick={() => appendKm({fromKm: 0, toKm: 0, ratePerKm: 0})}><PlusCircle className="mr-2 h-4 w-4" />Add KM Rate</Button>
                            </TabsContent>
                             <TabsContent value="truck">
                                {truckFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end mb-2">
                                        <FormField control={form.control} name={`truckRates.${index}.truckType`} render={({ field }) => (
                                            <FormItem><FormLabel>Truck Type</FormLabel><Combobox options={vehicleTypeOptions} {...field} placeholder="Select truck type..."/></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`truckRates.${index}.rate`} render={({ field }) => (
                                            <FormItem><FormLabel>Rate</FormLabel><Input type="number" {...field} /></FormItem>
                                        )} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTruck(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" size="sm" variant="outline" onClick={() => appendTruck({truckType: '', rate: 0})}><PlusCircle className="mr-2 h-4 w-4" />Add Truck Rate</Button>
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
