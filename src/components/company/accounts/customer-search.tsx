

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface CustomerSearchProps {
    customers: Customer[];
    onSelectCustomer: (customerName: string | null) => void;
}

export function CustomerSearch({ customers, onSelectCustomer }: CustomerSearchProps) {
    const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
    const customerOptions = customers.map(c => ({ label: c.name, value: c.name }));

    const handleSelectionChange = (value: string) => {
        const customerName = value || null;
        setSelectedValue(customerName ?? undefined);
        onSelectCustomer(customerName);
    };

    const handleReset = () => {
        setSelectedValue(undefined);
        onSelectCustomer(null);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Select a Party</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="w-full max-w-sm">
                        <Combobox
                            options={customerOptions}
                            value={selectedValue}
                            onChange={handleSelectionChange}
                            placeholder="Search and select a customer..."
                            searchPlaceholder="Search customers..."
                            notFoundMessage="No customer found."
                        />
                    </div>
                    <Button onClick={handleReset}>Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
}
