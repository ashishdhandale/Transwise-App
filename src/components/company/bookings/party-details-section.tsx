
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { AddCustomerDialog } from '../master/add-customer-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Customer, CustomerType } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';

interface PartyRowProps {
    side: 'Sender' | 'Receiver';
    customers: Customer[];
    onPartyAdded: () => void;
    onPartyChange: (party: Customer | null) => void;
    selectedParty: Customer | null;
}

const PartyRow = ({ side, customers, onPartyAdded, onPartyChange, selectedParty }: PartyRowProps) => {
    const { toast } = useToast();
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    
    const partyOptions = customers.map(c => ({ label: c.name, value: c.name }));

    const handleSelectParty = (value: string) => {
        const party = customers.find(p => p.name.toLowerCase() === value.toLowerCase());
        onPartyChange(party || { name: value, id: 0, gstin: '', address: '', mobile: '', email: '', type: 'Company' });
    };

    const handleSaveCustomer = (customerData: Omit<Customer, 'id'>) => {
        if (!customerData.name.trim() || !customerData.address.trim() || !customerData.mobile.trim()) {
            toast({ title: 'Error', description: 'Customer Name, Address, and Mobile Number are required.', variant: 'destructive' });
            return false;
        }

        try {
            const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
            const currentCustomers: Customer[] = savedCustomers ? JSON.parse(savedCustomers) : [];
            const newCustomer: Customer = {
                id: currentCustomers.length > 0 ? Math.max(...currentCustomers.map(c => c.id)) + 1 : 1,
                ...customerData
            };
            const updatedCustomers = [newCustomer, ...currentCustomers];
            localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(updatedCustomers));
            
            toast({ title: 'Customer Added', description: `"${customerData.name}" has been added to your master list.` });
            onPartyAdded();
            
            handleSelectParty(newCustomer.name);

            return true;
        } catch (error) {
            console.error("Failed to save new customer", error);
            toast({ title: 'Error', description: 'Could not save the new customer.', variant: 'destructive'});
            return false;
        }
    };


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_1fr] gap-x-4 gap-y-2 items-start p-3 border-b">
                <div className="space-y-1">
                    <Label className="font-semibold text-primary">{side} Name*</Label>
                    <Combobox
                        options={partyOptions}
                        value={selectedParty?.name || ''}
                        onChange={handleSelectParty}
                        placeholder={`Select ${side}...`}
                        searchPlaceholder="Search by name..."
                        notFoundMessage="No party found."
                        addMessage="Add New Party"
                        onAdd={() => setIsAddCustomerOpen(true)}
                    />
                </div>
                 <div className="space-y-1">
                    <Label>GST No.</Label>
                    <Input placeholder="GST Number" value={selectedParty?.gstin || ''} readOnly />
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
            <AddCustomerDialog
                isOpen={isAddCustomerOpen}
                onOpenChange={setIsAddCustomerOpen}
                onSave={handleSaveCustomer}
            />
        </>
    );
};

interface PartyDetailsSectionProps {
    onSenderChange: (party: Customer | null) => void;
    onReceiverChange: (party: Customer | null) => void;
    sender: Customer | null;
    receiver: Customer | null;
    onTaxPaidByChange: (value: string) => void;
    taxPaidBy: string;
}

export function PartyDetailsSection({ onSenderChange, onReceiverChange, sender, receiver, onTaxPaidByChange, taxPaidBy }: PartyDetailsSectionProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [billTo, setBillTo] = useState<string>('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [isSameAsReceiver, setIsSameAsReceiver] = useState(true);

    const loadCustomers = useCallback(() => {
        try {
            const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
            setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        } catch (error) {
            console.error("Failed to load party options", error);
            setCustomers([]);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);
    
    useEffect(() => {
        // Set default "Bill To" to sender if sender exists
        if (sender && !billTo) {
            setBillTo(sender.name);
        }
    }, [sender, billTo]);

    useEffect(() => {
        if (isSameAsReceiver && receiver) {
            setShippingAddress(receiver.address);
        } else if (!isSameAsReceiver) {
            // When unchecked, don't clear the address, just make it editable.
        } else {
            setShippingAddress('');
        }
    }, [receiver, isSameAsReceiver]);

    const billToOptions = [
        ... (sender ? [{ label: sender.name, value: sender.name }] : []),
        ... (receiver && receiver.name !== sender?.name ? [{ label: receiver.name, value: receiver.name }] : []),
    ];
    
    const taxPaidByOptions = [
        { label: 'Not Applicable', value: 'Not Applicable' },
        { label: 'Sender', value: 'Sender' },
        { label: 'Receiver', value: 'Receiver' },
        { label: 'Transporter', value: 'Transporter' },
    ];

    return (
        <div className="border rounded-md">
            <PartyRow side="Sender" customers={customers} onPartyAdded={loadCustomers} onPartyChange={onSenderChange} selectedParty={sender} />
            <PartyRow side="Receiver" customers={customers} onPartyAdded={loadCustomers} onPartyChange={onReceiverChange} selectedParty={receiver} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-3">
                 <div className="space-y-1">
                    <div className="flex items-center justify-between mb-1">
                        <Label className="font-semibold">Shipping Address</Label>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="sameAsReceiver" checked={isSameAsReceiver} onCheckedChange={(checked) => setIsSameAsReceiver(!!checked)} />
                            <Label htmlFor="sameAsReceiver" className="text-xs font-normal cursor-pointer">Same as Receiver</Label>
                        </div>
                    </div>
                    <Textarea 
                        placeholder="Shipping Address" 
                        rows={1} 
                        value={shippingAddress} 
                        onChange={(e) => setShippingAddress(e.target.value)}
                        readOnly={isSameAsReceiver}
                        className="min-h-[40px]" 
                    />
                </div>
                 <div className="space-y-1">
                    <Label className="font-semibold mb-1 block">Bill To</Label>
                    <Combobox
                        options={billToOptions}
                        value={billTo}
                        onChange={(val) => setBillTo(val)}
                        placeholder="Select party for billing..."
                        notFoundMessage="No parties selected."
                    />
                </div>
                 <div className="space-y-1">
                    <Label className="font-semibold mb-1 block">Tax Paid By</Label>
                    <Combobox
                        options={taxPaidByOptions}
                        value={taxPaidBy}
                        onChange={onTaxPaidByChange}
                        placeholder="Select who pays tax..."
                    />
                </div>
            </div>
        </div>
    );
}
