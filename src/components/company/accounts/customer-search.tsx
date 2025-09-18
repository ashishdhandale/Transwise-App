
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface CustomerSearchProps {
    customers: Customer[];
    onSelectCustomer: (customerName: string | null) => void;
}

export function CustomerSearch({ customers, onSelectCustomer }: CustomerSearchProps) {
    const customerOptions = customers.map(c => ({ label: c.name, value: c.name }));

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
                            onChange={(value) => onSelectCustomer(value)}
                            placeholder="Search and select a customer..."
                            searchPlaceholder="Search customers..."
                            notFoundMessage="No customer found."
                        />
                    </div>
                    <Button onClick={() => onSelectCustomer(null)}>Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
}
