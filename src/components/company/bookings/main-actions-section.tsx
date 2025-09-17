
'use client';

import { Button } from '@/components/ui/button';
import { Save, Ban, Repeat, FileUp, ListRestart, Printer, Calculator } from 'lucide-react';

export function MainActionsSection() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
        <Button className="bg-green-600 hover:bg-green-700"><Save className="mr-2 h-4 w-4" /> Save Booking</Button>
        <Button variant="destructive"><Ban className="mr-2 h-4 w-4" />Cancel Booking</Button>
        <Button variant="outline"><ListRestart className="mr-2 h-4 w-4" />Reset Form</Button>
        <Button variant="outline"><Repeat className="mr-2 h-4 w-4" />Repeat Booking</Button>
        <Button variant="outline"><FileUp className="mr-2 h-4 w-4" />Export</Button>
        <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
        <Button variant="outline"><Calculator className="mr-2 h-4 w-4" />Calculator</Button>
    </div>
  );
}
