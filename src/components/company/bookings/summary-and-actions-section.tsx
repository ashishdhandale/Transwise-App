
'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export function SummaryAndActionsSection() {
  return (
    <Card className="p-4 border-cyan-200 bg-cyan-50/20 h-full">
        <div className="space-y-2 flex flex-col h-full">
            <Label htmlFor="booking-note">Booking Note / Private Mark</Label>
            <Textarea id="booking-note" placeholder="Enter any notes for this booking..." className="flex-grow bg-white" rows={5} />
        </div>
    </Card>
  );
}
