
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addVoucher } from '@/lib/accounts-data';

export function ReceiptVoucher() {
  const { toast } = useToast();

  const handleSave = () => {
    // Logic for saving receipt voucher
    addVoucher({
      type: 'Receipt',
      date: new Date().toISOString(),
      account: 'Test Receipt Account',
      amount: 100,
      narration: 'Sample Receipt'
    });
    toast({
      title: 'Success',
      description: 'Receipt voucher saved (Not fully implemented).',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt Voucher</CardTitle>
        <CardDescription>Record cash or bank receipts from various accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Receipt voucher form will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
