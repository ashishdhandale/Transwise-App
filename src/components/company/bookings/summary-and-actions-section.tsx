
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save, Ban, Repeat, FileUp, ListRestart, Printer, Calculator } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function SummaryAndActionsSection() {
  return (
    <Card className="p-4 border-cyan-200 bg-cyan-50/20 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="space-y-2 flex flex-col">
                <Label htmlFor="booking-note">Booking Note / Private Mark</Label>
                <Textarea id="booking-note" placeholder="Enter any notes for this booking..." className="flex-grow bg-white" />
            </div>
            <div className="flex flex-col justify-between">
                <div className="flex flex-wrap gap-x-6 gap-y-3">
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
                <div className="flex flex-wrap gap-2 mt-4">
                    <Button className="bg-green-600 hover:bg-green-700"><Save className="mr-2 h-4 w-4" /> Save Booking</Button>
                    <Button variant="destructive"><Ban className="mr-2 h-4 w-4" />Cancel</Button>
                    <Button variant="outline"><ListRestart className="mr-2 h-4 w-4" />Reset</Button>
                    <Button variant="outline"><Repeat className="mr-2 h-4 w-4" />Repeat</Button>
                    <Button variant="outline"><FileUp className="mr-2 h-4 w-4" />Export</Button>
                    <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
                    <Button variant="outline"><Calculator className="mr-2 h-4 w-4" />Calc</Button>
                </div>
            </div>
        </div>
    </Card>
  );
}
