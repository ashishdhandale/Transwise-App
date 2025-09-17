
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { bookingOptions } from '@/lib/booking-data';

const partyOptions = bookingOptions.parties.map(p => ({ label: p.name, value: p.gst }));

const PartyInput = ({ side }: { side: 'Sender' | 'Receiver'}) => {
    const [partyValue, setPartyValue] = React.useState('');
    const [selectedParty, setSelectedParty] = React.useState<(typeof bookingOptions.parties)[0] | null>(null);

    const handleSelectParty = (value: string) => {
        setPartyValue(value);
        const party = bookingOptions.parties.find(p => p.gst === value);
        if (party) {
            setSelectedParty(party);
        } else {
            setSelectedParty(null);
        }
    }

    return (
        <Card className="p-4">
            <h3 className="font-semibold text-primary mb-3">{side} Details</h3>
            <div className="space-y-2">
                 <div className="space-y-1">
                    <Label>{side} Name*</Label>
                    <Combobox
                        options={partyOptions}
                        value={partyValue}
                        onChange={handleSelectParty}
                        placeholder={`Select ${side}...`}
                        searchPlaceholder="Search by name or GST..."
                        notFoundMessage="No party found."
                        addMessage="Add New Party"
                        onAdd={() => alert(`Adding new party: ${partyValue}`)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>{side} GST</Label>
                    <Input placeholder={`GST NO [${side} Name]`} value={selectedParty?.gst || ''} readOnly />
                </div>
                <div className="space-y-1">
                    <Label>{side} Address</Label>
                    <Textarea placeholder="Address Line" rows={2} value={selectedParty?.address || ''} readOnly/>
                </div>
                <div className="space-y-1">
                    <Label>Mobile No.</Label>
                    <Input placeholder="10 Digits Only" value={selectedParty?.mobile || ''} readOnly />
                </div>
            </div>
        </Card>
    );
};


export function PartyDetailsSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PartyInput side="Sender" />
            <PartyInput side="Receiver" />
        </div>
    );
}
