
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Trash2, PlusCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Combobox } from '@/components/ui/combobox';
import type { Customer, Vendor } from '@/lib/types';
import { DatePicker } from '@/components/ui/date-picker';
import { addVoucher } from '@/lib/accounts-data';
import { getVendors } from '@/lib/vendor-data';

const paymentEntrySchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  narration: z.string().optional(),
});

const paymentVoucherSchema = z.object({
  voucherNo: z.string(),
  date: z.date(),
  cashBankAccountId: z.string().min(1, 'Cash/Bank account is required'),
  entries: z.array(paymentEntrySchema).min(1, 'At least one payment entry is required'),
});

type PaymentVoucherValues = z.infer<typeof paymentVoucherSchema>;

export function PaymentVoucher() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const form = useForm<PaymentVoucherValues>({
    resolver: zodResolver(paymentVoucherSchema),
    defaultValues: {
      voucherNo: `PAY-${Date.now()}`,
      date: new Date(),
      cashBankAccountId: 'Cash',
      entries: [{ accountId: '', amount: 0, narration: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'entries',
  });
  
  useEffect(() => {
    setVendors(getVendors());
  }, []);

  const accountOptions = [
    { label: 'CASH', value: 'Cash' },
    ...vendors.map(v => ({ label: v.name, value: v.name }))
  ];
  
  const cashBankOptions = [
      { label: 'CASH', value: 'Cash' },
      { label: 'BANK OF INDIA', value: 'Bank of India' }
  ];


  const onSubmit = (data: PaymentVoucherValues) => {
    const totalAmount = data.entries.reduce((sum, entry) => sum + entry.amount, 0);
    
    addVoucher({
        type: 'Payment',
        date: data.date.toISOString(),
        account: data.cashBankAccountId,
        amount: totalAmount,
        narration: `Payment to multiple accounts. Voucher: ${data.voucherNo}`
    });

    data.entries.forEach(entry => {
        addVoucher({
            type: 'Payment',
            date: data.date.toISOString(),
            account: entry.accountId,
            amount: entry.amount,
            narration: `Payment from ${data.cashBankAccountId}. ${entry.narration}`
        });
    });

    toast({ title: 'Payment Voucher Saved', description: `Voucher ${data.voucherNo} has been recorded.` });
    form.reset({
      voucherNo: `PAY-${Date.now()}`,
      date: new Date(),
      cashBankAccountId: 'Cash',
      entries: [{ accountId: '', amount: 0, narration: '' }],
    });
  };

  const totalAmount = form.watch('entries').reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Voucher</CardTitle>
        <CardDescription>Record cash or bank payments made to various accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="voucherNo" render={({ field }) => (
                    <FormItem><FormLabel>Voucher No</FormLabel><FormControl><Input {...field} readOnly /></FormControl></FormItem>
                )}/>
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl></FormItem>
                )}/>
                <FormField control={form.control} name="cashBankAccountId" render={({ field }) => (
                    <FormItem><FormLabel>Payment From</FormLabel><Combobox options={cashBankOptions} {...field} placeholder="Select Account..."/></FormItem>
                )}/>
             </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paid To Account</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Narration</TableHead>
                            <TableHead className="w-12">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                    <FormField control={form.control} name={`entries.${index}.accountId`} render={({ field }) => (
                                        <Combobox options={accountOptions} {...field} placeholder="Select Account..."/>
                                    )}/>
                                </TableCell>
                                <TableCell>
                                    <FormField control={form.control} name={`entries.${index}.amount`} render={({ field }) => (
                                        <Input type="number" {...field} />
                                    )}/>
                                </TableCell>
                                <TableCell>
                                    <FormField control={form.control} name={`entries.${index}.narration`} render={({ field }) => (
                                        <Input {...field} placeholder="Optional narration"/>
                                    )}/>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell className="text-right font-bold">Total</TableCell>
                            <TableCell className="font-bold">{totalAmount.toFixed(2)}</TableCell>
                            <TableCell colSpan={2}>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ accountId: '', amount: 0, narration: '' })}><PlusCircle className="h-4 w-4 mr-2"/>Add Row</Button>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="flex justify-end">
                <Button type="submit"><Save className="h-4 w-4 mr-2"/>Save Voucher</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
