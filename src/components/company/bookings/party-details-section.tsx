'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { bookingOptions } from '@/lib/booking-data';
import { Card, CardContent } from '@/components/ui/card';

const PartyInput = ({ side }: { side: 'Sender' | 'Receiver'}) => (
    <div className="space-y-2">
        <div className="space-y-1">
            <Label>{side} Name*</Label>
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder={`${side} Name [GST NO]`} />
                </SelectTrigger>
                 <SelectContent>
                    {bookingOptions.parties.map(p => <SelectItem key={p.gst} value={p.name}>{`${p.name} [${p.gst}]`}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-1">
            <Label>{side} GST</Label>
            <div className="flex gap-1">
                 <Select>
                    <SelectTrigger>
                        <SelectValue placeholder={`GST NO [${side} Name]`} />
                    </SelectTrigger>
                    <SelectContent>
                        {bookingOptions.parties.map(p => <SelectItem key={p.gst} value={p.gst}>{`${p.gst} [${p.name}]`}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button size="icon" variant="outline" className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 shrink-0">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </div>
        <div className="space-y-1">
            <Label>{side} Address</Label>
            <Textarea placeholder="Address Line" rows={2} />
        </div>
         <div className="space-y-1">
            <Label>Mobile No.</Label>
            <Input placeholder="10 Digits Only" />
        </div>
    </div>
);

export function PartyDetailsSection() {
    return (
        <Card>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <PartyInput side="Sender" />
                <PartyInput side="Receiver" />
            </CardContent>
        </Card>
    );
}
