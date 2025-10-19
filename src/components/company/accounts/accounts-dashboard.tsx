

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AccountSearch } from './account-search';
import { LedgerTable } from './ledger-table';
import { LedgerSummary } from './ledger-summary';
import type { Account } from '@/lib/types';
import type { LedgerEntry } from '@/lib/accounts-data';
import { getLedgerForCustomer } from '@/lib/accounts-data';
import { getLedgerForVendor } from '@/lib/vendor-accounts-data';
import { loadCompanySettingsFromStorage } from '@/app/company/settings/actions';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import { getAccounts } from '@/lib/account-data';

export function AccountsDashboard() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [companyProfile, setCompanyProfile] = useState<AllCompanySettings | null>(null);

    useEffect(() => {
        function loadData() {
            try {
                const profile = loadCompanySettingsFromStorage();
                setCompanyProfile(profile);
                setAccounts(getAccounts());
            } catch (error) {
                console.error("Failed to load initial data", error);
            }
        }
        loadData();
    }, []);

    const handleAccountSelect = (accountId: string | null) => {
        if (!accountId) {
            setSelectedAccount(null);
            setLedger([]);
            return;
        }

        const account = accounts.find(c => c.id === accountId);
        if (account) {
            setSelectedAccount(account);
            if (account.type === 'Customer') {
                 // The `getLedgerForCustomer` expects a `Customer` object, but our `Account` object has the same shape.
                 // We can cast it for now. In a more complex app, we might fetch the full customer object.
                setLedger(getLedgerForCustomer(account as any));
            } else if (account.type === 'Vendor') {
                // Similarly, casting for vendor.
                setLedger(getLedgerForVendor(account as any));
            } else {
                // For other account types (Cash, Bank, Expense), we'll show a placeholder for now.
                // A future implementation would generate their ledgers too.
                setLedger([
                     { date: '2024-04-01', particulars: 'Opening Balance', balance: account.openingBalance },
                ]);
            }
        } else {
            setSelectedAccount(null);
            setLedger([]);
        }
    };
    
    const openingBalance = useMemo(() => {
        const obEntry = ledger.find(entry => entry.particulars === 'Opening Balance');
        return obEntry?.balance || 0;
    }, [ledger]);
    
    const totalDebit = useMemo(() => {
        return ledger.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    }, [ledger]);

    const totalCredit = useMemo(() => {
        return ledger.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    }, [ledger]);
    
    const closingBalance = openingBalance + totalDebit - totalCredit;

    return (
        <main className="flex-1 p-4 md:p-6 bg-secondary/30">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Wallet className="h-8 w-8" />
                    Accounts Ledger
                </h1>
            </header>

            <div className="space-y-4">
                <AccountSearch accounts={accounts} onSelectAccount={handleAccountSelect} />

                <Card>
                    <CardContent className="p-4">
                        {selectedAccount && companyProfile ? (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <LedgerTable entries={ledger} accountName={selectedAccount.name} />
                                </div>
                                <div className="lg:col-span-1">
                                    <LedgerSummary
                                        openingBalance={openingBalance}
                                        totalDebit={totalDebit}
                                        totalCredit={totalCredit}
                                        closingBalance={closingBalance}
                                        profile={companyProfile}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-64 items-center justify-center border-dashed border-2 rounded-md">
                                <p className="text-muted-foreground">Select an account to view its ledger.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
