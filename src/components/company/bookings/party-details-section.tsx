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
    <Card className="p-4">
        <h3 className="font-semibold text-primary mb-3">{side} Details</h3>
        <div className="space-y-3">
            <div className="space-y-1">
                <Label>{side} Name*</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder={`${side} Name`} />
                    </SelectTrigger>
                    <SelectContent>
                        {bookingOptions.parties.map(p => <SelectItem key={p.gst} value={p.name}>{`${p.name} [${p.gst}]`}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label>{side} GST</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder={`GST NO [${side} Name]`} />
                    </SelectTrigger>
                    <SelectContent>
                        {bookingOptions.parties.map(p => <SelectItem key={p.gst} value={p.gst}>{`${p.gst} [${p.name}]`}</SelectItem>)}
                    </SelectContent>
                </Select>
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
    </Card>
);


export function PartyDetailsSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PartyInput side="Sender" />
            <PartyInput side="Receiver" />
        </div>
    );
}
