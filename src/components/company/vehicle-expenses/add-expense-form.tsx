
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { VehicleMaster } from '@/lib/types';
import { saveVehicleExpenses, getVehicleExpenses } from '@/lib/vehicle-expenses-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const expenseSchema = z.object({
  vehicleNo: z.string().min(1, 'Vehicle is required.'),
  expenseType: z.enum(['Fuel', 'Maintenance', 'Parts', 'Insurance', 'Tyre Replacement', 'Other']),
  date: z.date({ required_error: 'Date is required.' }),
  amount: z.coerce.number().min(0.01, 'Amount must be positive.'),
  description: z.string().min(3, 'A brief description is required.'),
  vendor: z.string().optional(),
  odometer: z.coerce.number().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseFormProps {
    vehicles: VehicleMaster[];
    onExpenseAdded: () => void;
}

export function AddExpenseForm({ vehicles, onExpenseAdded }: AddExpenseFormProps) {
    const { toast } = useToast();

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            vehicleNo: '',
            expenseType: 'Maintenance',
            date: new Date(),
            amount: undefined,
            description: '',
            vendor: '',
            odometer: undefined,
        },
    });

    const onSubmit = (data: ExpenseFormValues) => {
        const allExpenses = getVehicleExpenses();
        const newExpense = {
            id: Date.now(),
            ...data,
            date: data.date.toISOString(),
        };
        saveVehicleExpenses([newExpense, ...allExpenses]);
        toast({ title: 'Expense Added', description: `${data.expenseType} expense of ${data.amount} for ${data.vehicleNo} has been logged.` });
        form.reset({
            vehicleNo: data.vehicleNo, // Keep vehicle selected
            expenseType: 'Maintenance',
            date: new Date(),
            amount: undefined,
            description: '',
            vendor: '',
            odometer: undefined,
        });
        onExpenseAdded();
    };

    const vehicleOptions = vehicles.map(v => ({ label: v.vehicleNo, value: v.vehicleNo }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Log New Expense</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="vehicleNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle</FormLabel>
                                    <Combobox options={vehicleOptions} {...field} placeholder="Select Vehicle" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expenseType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expense Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            <SelectItem value="Fuel">Fuel</SelectItem>
                                            <SelectItem value="Parts">Parts</SelectItem>
                                            <SelectItem value="Tyre Replacement">Tyre Replacement</SelectItem>
                                            <SelectItem value="Insurance">Insurance</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Oil Change, Diesel Fill" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="vendor" render={({ field }) => (
                            <FormItem><FormLabel>Vendor (Optional)</FormLabel><FormControl><Input placeholder="e.g., Service Center Name" {...field} /></FormControl></FormItem>
                        )}/>
                         <FormField control={form.control} name="odometer" render={({ field }) => (
                            <FormItem><FormLabel>Odometer (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 125000" {...field} /></FormControl></FormItem>
                        )}/>

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                            Log Expense
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
