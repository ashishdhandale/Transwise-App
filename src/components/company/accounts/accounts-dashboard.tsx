
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerSearch } from './customer-search';
import { LedgerTable } from './ledger-table';
import { LedgerSummary } from './ledger-summary';
import type { Customer } from '@/lib/types';
import type { LedgerEntry } from '@/lib/accounts-data';
import { getLedgerForCustomer } from '@/lib/accounts-data';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';

const CUSTOMERS_KEY = 'transwise_customers';

export function AccountsDashboard() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const profile = await getCompanyProfile();
                setCompanyProfile(profile);
                const savedCustomers = localStorage.getItem(CUSTOMERS_KEY);
                if (savedCustomers) {
                    setCustomers(JSON.parse(savedCustomers));
                }
            } catch (error) {
                console.error("Failed to load initial data", error);
            }
        }
        loadData();
    }, []);

    const handleCustomerSelect = (customerName: string | null) => {
        if (!customerName) {
            setSelectedCustomer(null);
            setLedger([]);
            return;
        }

        const customer = customers.find(c => c.name === customerName);
        if (customer) {
            setSelectedCustomer(customer);
            // In a real app, you'd fetch this from a server.
            // For this prototype, we now generate it from local storage bookings.
            setLedger(getLedgerForCustomer(customer));
        } else {
            setSelectedCustomer(null);
            setLedger([]);
        }
    };
    
    const openingBalance = useMemo(() => {
        return ledger.find(entry => entry.particulars === 'Opening Balance')?.balance || 0;
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
                    Customer Accounts
                </h1>
            </header>

            <div className="space-y-4">
                <CustomerSearch customers={customers} onSelectCustomer={handleCustomerSelect} />

                <Card>
                    <CardContent className="p-4">
                        {selectedCustomer && companyProfile ? (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <LedgerTable entries={ledger} customerName={selectedCustomer.name} />
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
                                <p className="text-muted-foreground">Select a customer to view their ledger.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
