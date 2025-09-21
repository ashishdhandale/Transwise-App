
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { Vendor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface VendorSearchProps {
    vendors: Vendor[];
    onSelectVendor: (vendorName: string | null) => void;
}

export function VendorSearch({ vendors, onSelectVendor }: VendorSearchProps) {
    const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
    const vendorOptions = vendors.map(v => ({ label: v.name, value: v.name }));

    const handleSelectionChange = (value: string) => {
        const vendorName = value || null;
        setSelectedValue(vendorName ?? undefined);
        onSelectVendor(vendorName);
    };

    const handleReset = () => {
        setSelectedValue(undefined);
        onSelectVendor(null);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Select a Vendor</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="w-full max-w-sm">
                        <Combobox
                            options={vendorOptions}
                            value={selectedValue}
                            onChange={handleSelectionChange}
                            placeholder="Search and select a vendor..."
                            searchPlaceholder="Search vendors..."
                            notFoundMessage="No vendor found."
                        />
                    </div>
                    <Button onClick={handleReset}>Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
}
