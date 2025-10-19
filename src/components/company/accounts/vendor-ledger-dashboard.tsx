
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Handshake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { VendorSearch } from './vendor-search';
import { LedgerTable } from './ledger-table';
import { LedgerSummary } from './ledger-summary';
import type { Vendor } from '@/lib/types';
import type { LedgerEntry } from '@/lib/accounts-data';
import { getLedgerForVendor } from '@/lib/vendor-accounts-data';
import { getCompanySettings } from '@/app/company/settings/actions';
import type { AllCompanySettings } from '@/app/company/settings/actions';

const VENDORS_KEY = 'transwise_vendors';

export function VendorLedgerDashboard() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [companyProfile, setCompanyProfile] = useState<AllCompanySettings | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const profile = await getCompanySettings();
                setCompanyProfile(profile);
                const savedVendors = localStorage.getItem(VENDORS_KEY);
                if (savedVendors) {
                    setVendors(JSON.parse(savedVendors));
                }
            } catch (error) {
                console.error("Failed to load initial data", error);
            }
        }
        loadData();
    }, []);

    const handleVendorSelect = (vendorName: string | null) => {
        if (!vendorName) {
            setSelectedVendor(null);
            setLedger([]);
            return;
        }

        const vendor = vendors.find(c => c.name === vendorName);
        if (vendor) {
            setSelectedVendor(vendor);
            setLedger(getLedgerForVendor(vendor));
        } else {
            setSelectedVendor(null);
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
    
    const closingBalance = openingBalance - totalDebit + totalCredit;

    return (
        <main className="flex-1 p-4 md:p-6 bg-secondary/30">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Handshake className="h-8 w-8" />
                    Vendor Ledger
                </h1>
            </header>

            <div className="space-y-4">
                <VendorSearch vendors={vendors} onSelectVendor={handleVendorSelect} />

                <Card>
                    <CardContent className="p-4">
                        {selectedVendor && companyProfile ? (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <LedgerTable entries={ledger} customerName={selectedVendor.name} />
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
                                <p className="text-muted-foreground">Select a vendor to view their ledger.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
