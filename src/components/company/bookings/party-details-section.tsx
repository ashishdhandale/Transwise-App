
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { AddCustomerDialog } from '../master/add-customer-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Customer, CustomerType } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';

interface PartyRowProps {
    side: 'Sender' | 'Receiver';
    customers: Customer[];
    onPartyAdded: () => void;
    onPartyChange: (party: Customer | null | ((prev: Customer | null) => Customer | null)) => void;
    initialParty: Customer | null;
    hasError: boolean;
    disabled: boolean;
}

const PartyRow = ({ side, customers, onPartyAdded, onPartyChange, initialParty, hasError, disabled }: PartyRowProps) => {
    const { toast } = useToast();
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [initialCustomerData, setInitialCustomerData] = useState<Partial<Customer> | null>(null);

    // A party is considered "from master" if it has a non-zero ID.
    const isFromMaster = !!initialParty?.id;

    const handlePartySelect = useCallback((partyName: string) => {
        const selectedParty = customers.find(c => c.name.toLowerCase() === partyName.toLowerCase());
        if (selectedParty) {
            onPartyChange(selectedParty);
        } else {
             onPartyChange({
                id: 0, // 0 indicates a new, unsaved customer
                name: partyName,
                gstin: '',
                address: '',
                mobile: '',
                email: '',
                type: 'Company',
                openingBalance: 0
            });
        }
    }, [customers, onPartyChange]);
    
    const handleDetailChange = (field: keyof Customer, value: string) => {
        if (isFromMaster) return; // Don't allow editing master data here
        onPartyChange(prev => {
            const newParty = { ...(prev || { name: '' }), [field]: value } as Customer;
            if (!prev?.id) newParty.id = 0; // Ensure it remains a "new" customer
            return newParty;
        });
    };

    const handleOpenAddCustomer = (query?: string) => {
        setInitialCustomerData(query ? { name: query } : null);
        setIsAddCustomerOpen(true);
    };

    const handleSaveCustomer = (customerData: Omit<Customer, 'id'>): boolean => {
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
            onPartyChange(newCustomer);

            return true;
        } catch (error) {
            console.error("Failed to save new customer", error);
            toast({ title: 'Error', description: 'Could not save the new customer.', variant: 'destructive'});
            return false;
        }
    };

    const errorClass = 'border-red-500 ring-2 ring-red-500/50';

    const customerOptions = useMemo(() => customers.map(c => ({
        label: c.name.toUpperCase(),
        value: c.name
    })), [customers]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_1fr] gap-x-4 gap-y-2 items-start p-3 border-b">
                <div className={cn("space-y-1 rounded-md", hasError && 'ring-2 ring-red-500/50')}>
                    <Label className="font-semibold text-primary">{side} Name*</Label>
                    <Combobox
                        options={customerOptions}
                        value={initialParty?.name}
                        onChange={handlePartySelect}
                        placeholder={`Select or enter ${side}...`}
                        searchPlaceholder="Search customers..."
                        notFoundMessage="No customer found."
                        addMessage="Add New Party"
                        onAdd={handleOpenAddCustomer}
                        disabled={disabled}
                    />
                </div>
                 <div className="space-y-1">
                    <Label>GST No.</Label>
                    <Input 
                        placeholder="GST Number" 
                        value={initialParty?.gstin || ''} 
                        onChange={(e) => handleDetailChange('gstin', e.target.value)}
                        readOnly={isFromMaster || disabled} 
                    />
                </div>
                <div className="space-y-1">
                    <Label>Address</Label>
                    <Textarea 
                        placeholder="Party Address" 
                        rows={1} 
                        value={initialParty?.address || ''} 
                        onChange={(e) => handleDetailChange('address', e.target.value)}
                        readOnly={isFromMaster || disabled}
                        className="min-h-[38px]" 
                    />
                </div>
                <div className="space-y-1">
                    <Label>Mobile No.</Label>
                    <Input 
                        placeholder="10 Digits Only" 
                        value={initialParty?.mobile || ''}
                        onChange={(e) => handleDetailChange('mobile', e.target.value)}
                        readOnly={isFromMaster || disabled}
                    />
                </div>
            </div>
            <AddCustomerDialog
                isOpen={isAddCustomerOpen}
                onOpenChange={setIsAddCustomerOpen}
                onSave={handleSaveCustomer}
                customer={initialCustomerData}
            />
        </>
    );
};

interface PartyDetailsSectionProps {
    onSenderChange: (party: Customer | null | ((prev: Customer | null) => Customer | null)) => void;
    onReceiverChange: (party: Customer | null | ((prev: Customer | null) => Customer | null)) => void;
    sender: Customer | null;
    receiver: Customer | null;
    onTaxPaidByChange: (value: string) => void;
    taxPaidBy: string;
    errors: { [key: string]: boolean };
    isViewOnly?: boolean;
    isOfflineMode?: boolean;
    onPartyAdded: () => void; // New prop to notify parent about new customer
}

export function PartyDetailsSection({ 
    onSenderChange, 
    onReceiverChange, 
    sender, 
    receiver, 
    onTaxPaidByChange, 
    taxPaidBy, 
    errors, 
    isViewOnly = false, 
    isOfflineMode = false,
    onPartyAdded
}: PartyDetailsSectionProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [billTo, setBillTo] = useState<string>('');
    const [otherBillToParty, setOtherBillToParty] = useState<string | undefined>(undefined);
    const [shippingAddress, setShippingAddress] = useState('');
    const [isSameAsReceiver, setIsSameAsReceiver] = useState(true);
    const [isExtraDetailsOpen, setIsExtraDetailsOpen] = useState(false);

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
        ...(sender ? [{ label: sender.name, value: sender.name }] : []),
        ...(receiver && receiver.name !== sender?.name ? [{ label: receiver.name, value: receiver.name }] : []),
        { label: 'Other', value: 'Other' },
    ].filter(option => option.value);
    
    const taxPaidByOptions = useMemo(() => {
        const options = [
            { label: 'Not Applicable', value: 'Not Applicable' },
            { label: 'Sender', value: 'Sender' },
            { label: 'Receiver', value: 'Receiver' },
            { label: 'Transporter', value: 'Transporter' },
        ];

        if (billTo === 'Other' && otherBillToParty) {
            const isAlreadyListed = options.some(opt => opt.value === otherBillToParty) ||
                                     sender?.name === otherBillToParty ||
                                     receiver?.name === otherBillToParty;
            
            const isStandardOption = ['Sender', 'Receiver'].includes(otherBillToParty);

            if (!isAlreadyListed && !isStandardOption) {
                 options.push({ label: otherBillToParty, value: otherBillToParty });
            }
        }
        return options.filter(option => option.value);
    }, [billTo, otherBillToParty, sender, receiver]);

    const customerOptions = useMemo(() => customers.map(c => ({
        label: c.name.toUpperCase(),
        value: c.name
    })), [customers]);

    return (
        <div className="border rounded-md">
            <PartyRow side="Sender" customers={customers} onPartyAdded={onPartyAdded} onPartyChange={onSenderChange} initialParty={sender} hasError={errors.sender} disabled={isViewOnly} />
            <PartyRow side="Receiver" customers={customers} onPartyAdded={onPartyAdded} onPartyChange={onReceiverChange} initialParty={receiver} hasError={errors.receiver} disabled={isViewOnly} />
            
            <Collapsible open={isExtraDetailsOpen} onOpenChange={setIsExtraDetailsOpen}>
                <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-muted/50">
                        <span className="text-sm font-semibold text-muted-foreground">More Details (Billing, Shipping)</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-3">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between mb-1">
                                <Label className="font-semibold">Shipping Address</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sameAsReceiver" checked={isSameAsReceiver} onCheckedChange={(checked) => setIsSameAsReceiver(!!checked)} disabled={isViewOnly} />
                                    <Label htmlFor="sameAsReceiver" className="text-xs font-normal cursor-pointer">Same as Receiver</Label>
                                </div>
                            </div>
                            <Textarea 
                                placeholder="Shipping Address" 
                                rows={1} 
                                value={shippingAddress} 
                                onChange={(e) => setShippingAddress(e.target.value)}
                                readOnly={isSameAsReceiver || isViewOnly}
                                className="min-h-[40px]" 
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="bill-to" className="font-semibold mb-1 block">Bill To</Label>
                            <Select onValueChange={setBillTo} value={billTo} disabled={isViewOnly}>
                                <SelectTrigger id="bill-to">
                                    <SelectValue placeholder="Select party for billing..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {billToOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {billTo === 'Other' && (
                                <div className="mt-2">
                                    <Combobox
                                        options={customerOptions}
                                        value={otherBillToParty}
                                        onChange={setOtherBillToParty}
                                        placeholder="Select billing party..."
                                        searchPlaceholder="Search customers..."
                                        notFoundMessage="No customer found."
                                        disabled={isViewOnly}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="tax-paid-by" className="font-semibold mb-1 block">Tax Paid By</Label>
                            <Select onValueChange={onTaxPaidByChange} value={taxPaidBy} disabled={isViewOnly}>
                                <SelectTrigger id="tax-paid-by">
                                    <SelectValue placeholder="Select who pays tax..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {taxPaidByOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
