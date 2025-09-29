
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { Account } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AccountSearchProps {
    accounts: Account[];
    onSelectAccount: (accountId: string | null) => void;
}

export function AccountSearch({ accounts, onSelectAccount }: AccountSearchProps) {
    const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
    const accountOptions = accounts.map(a => ({ label: a.name, value: a.id }));

    const handleSelectionChange = (value: string) => {
        const accountId = value || null;
        setSelectedValue(accountId ?? undefined);
        onSelectAccount(accountId);
    };

    const handleReset = () => {
        setSelectedValue(undefined);
        onSelectAccount(null);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Select an Account</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="w-full max-w-sm">
                        <Combobox
                            options={accountOptions}
                            value={selectedValue}
                            onChange={handleSelectionChange}
                            placeholder="Search and select an account..."
                            searchPlaceholder="Search accounts..."
                            notFoundMessage="No account found."
                        />
                    </div>
                    <Button onClick={handleReset}>Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
}
