
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { AddCustomerDialog } from '../master/add-customer-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/lib/types';

const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';
const initialCustomers: Customer[] = [
    { id: 1, name: 'NOVA INDUSTERIES', gstin: '27AAFCN0123A1Z5', address: '123, Industrial Area, Ahmedabad', mobile: '9876543210', email: 'contact@nova.com', type: 'Company'},
    { id: 2, name: 'MONIKA SALES', gstin: '22AAAAA0000A1Z5', address: '456, Trade Center, Mumbai', mobile: '9876543211', email: 'sales@monika.com', type: 'Individual' },
    { id: 3, name: 'PARTY NAME1', gstin: '24ABCDE1234F1Z5', address: '789, Business Park, Pune', mobile: '9876543212', email: 'party1@example.com', type: 'Company' },
];

interface PartyRowProps {
    side: 'Sender' | 'Receiver';
    partyOptions: { label: string; value: string; }[];
    onPartyAdded: () => void;
}

const PartyRow = ({ side, partyOptions, onPartyAdded }: PartyRowProps) => {
    const { toast } = useToast();
    const [partyValue, setPartyValue] = React.useState('');
    const [selectedParty, setSelectedParty] = React.useState<Partial<Customer> | null>(null);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        try {
            const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
            setCustomers(savedCustomers ? JSON.parse(savedCustomers) : initialCustomers);
        } catch (error) {
            console.error("Failed to load customers", error);
            setCustomers(initialCustomers);
        }
    }, []);

    const handleSelectParty = (value: string) => {
        setPartyValue(value);
        // The value from combobox is the customer's name, which we treat as the value.
        const party = customers.find(p => p.name.toLowerCase() === value.toLowerCase());
        if (party) {
            setSelectedParty(party);
        } else {
            // Handle case where a new name is typed that doesn't match any customer
            setSelectedParty({ name: value });
        }
    };

    const handleSaveCustomer = (customerData: Omit<Customer, 'id'>) => {
        try {
            const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
            const customers: Customer[] = savedCustomers ? JSON.parse(savedCustomers) : [];
            const newCustomer: Customer = {
                id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
                ...customerData
            };
            const updatedCustomers = [newCustomer, ...customers];
            localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(updatedCustomers));
            
            toast({ title: 'Customer Added', description: `"${customerData.name}" has been added to your master list.` });
            onPartyAdded(); // Callback to refresh options in parent
            
            // Automatically select the newly added customer
            handleSelectParty(newCustomer.name);

            return true; // Success
        } catch (error) {
            console.error("Failed to save new customer", error);
            toast({ title: 'Error', description: 'Could not save the new customer.', variant: 'destructive'});
            return false; // Failure
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

export function PartyDetailsSection() {
    const [partyOptions, setPartyOptions] = useState<{ label: string; value: string; }[]>([]);

    const loadPartyOptions = useCallback(() => {
        try {
            const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
            const customers: Customer[] = savedCustomers ? JSON.parse(savedCustomers) : initialCustomers;
            setPartyOptions(customers.map(c => ({ label: c.name, value: c.name })));
        } catch (error) {
            console.error("Failed to load party options", error);
            setPartyOptions([]);
        }
    }, []);

    useEffect(() => {
        loadPartyOptions();
    }, [loadPartyOptions]);

    return (
        <div className="border rounded-md">
            <PartyRow side="Sender" partyOptions={partyOptions} onPartyAdded={loadPartyOptions} />
            <PartyRow side="Receiver" partyOptions={partyOptions} onPartyAdded={loadPartyOptions} />
        </div>
    );
}