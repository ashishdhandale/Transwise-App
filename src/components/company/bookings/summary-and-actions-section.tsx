
'use client';

import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export function SummaryAndActionsSection() {
  return (
    <Card className="p-4 border-cyan-200 bg-cyan-50/20 h-full">
        <div className="space-y-2 flex flex-col h-full">
            <Label htmlFor="booking-note">Booking Note / Private Mark</Label>
            <Textarea id="booking-note" placeholder="Enter any notes for this booking..." className="flex-grow bg-white" />
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                    <div className="flex items-center space-x-2">
                    <Checkbox id="updateRates" />
                    <Label htmlFor="updateRates">Update Rates</Label>
                </div>
                    <div className="flex items-center space-x-2">
                    <Checkbox id="updateParty" />
                    <Label htmlFor="updateParty">Update Party</Label>
                </div>
                    <div className="flex items-center space-x-2">
                    <Checkbox id="roundOff" />
                    <Label htmlFor="roundOff">Round Off</Label>
                </div>
            </div>
        </div>
    </Card>
  );
}
