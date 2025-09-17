
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { bookingOptions } from '@/lib/booking-data';

const partyOptions = bookingOptions.parties.map(p => ({ label: p.name, value: p.gst }));

interface PartyRowProps {
    side: 'Sender' | 'Receiver';
}

const PartyRow = ({ side }: PartyRowProps) => {
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
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_1fr] gap-x-4 gap-y-2 items-start p-3 border-b">
            <div className="space-y-1">
                <Label className="font-semibold text-primary">{side} Name*</Label>
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
                <Label>GST No.</Label>
                <Input placeholder="GST Number" value={selectedParty?.gst || ''} readOnly />
            </div>
            <div className="space-y-1">
                <Label>Address</Label>
                <Textarea placeholder="Party Address" rows={1} value={selectedParty?.address || ''} readOnly className="min-h-[38px]" />
            </div>
            <div className="space-y-1">
                <Label>Mobile No.</Label>
                <Input placeholder="10 Digits Only" value={selectedParty?.mobile || ''} readOnly />
            </div>
        </div>
    )
}

export function PartyDetailsSection() {
    return (
        <div className="border rounded-md">
            <PartyRow side="Sender" />
            <PartyRow side="Receiver" />
        </div>
    );
}
