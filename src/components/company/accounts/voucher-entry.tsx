
'use client';

import { Sheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentVoucher } from './payment-voucher';
import { ReceiptVoucher } from './receipt-voucher';
import { JournalVoucher } from './journal-voucher';

export function VoucherEntry() {
    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Sheet className="h-8 w-8" />
                    Voucher Entry
                </h1>
            </header>

            <Card>
                <CardContent className="p-4">
                    <Tabs defaultValue="payment" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="payment">Payment Voucher</TabsTrigger>
                            <TabsTrigger value="receipt">Receipt Voucher</TabsTrigger>
                            <TabsTrigger value="journal">Journal Voucher</TabsTrigger>
                        </TabsList>
                        <TabsContent value="payment">
                           <PaymentVoucher />
                        </TabsContent>
                        <TabsContent value="receipt">
                            <ReceiptVoucher />
                        </TabsContent>
                        <TabsContent value="journal">
                            <JournalVoucher />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
