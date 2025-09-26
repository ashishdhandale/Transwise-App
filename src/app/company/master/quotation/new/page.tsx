
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import type { Customer, RateList } from '@/lib/types';
import { getCustomers } from '@/lib/customer-data';
import { getRateLists, saveRateLists } from '@/lib/rate-list-data';
import { useToast } from '@/hooks/use-toast';
import { FileSignature, PlusCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import DashboardLayout from '../../../../(dashboard)/layout';
import { Suspense } from 'react';


function NewQuotationPage() {
    const [quotationNo, setQuotationNo] = useState('');
    const [quotationDate, setQuotationDate] = useState<Date | undefined>(new Date());
    const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const allRateLists = getRateLists();
        const lastQuotationNo = allRateLists
            .map(list => parseInt(list.name.split('-')[0], 10))
            .filter(num => !isNaN(num))
            .reduce((max, current) => Math.max(max, current), 0);
        
        const newQuotationNo = (lastQuotationNo + 1).toString().padStart(4, '0');
        setQuotationNo(newQuotationNo);

        setCustomers(getCustomers());
    }, []);

    const customerOptions = useMemo(() => 
        customers.map(c => ({ label: c.name, value: c.name })),
    [customers]);

    const handleCreateQuotation = () => {
        if (!selectedCustomer) {
            toast({
                title: 'Customer not selected',
                description: 'Please select a customer for the quotation.',
                variant: 'destructive',
            });
            return;
        }

        // For now, we are just navigating. 
        // The detailed form will be built in the next step.
        // We can pass the details via query params to the new page.
        // A real implementation might save a draft here and navigate to the edit page.
        toast({
            title: 'Next Step',
            description: `Now, please fill out the item details for ${selectedCustomer}'s quotation.`,
        });
        
        // This is a placeholder for the next step where a full popup form will open.
        // For now, we can simulate the creation and redirect.
        
        // Example of creating a draft rate list:
        const customer = customers.find(c => c.name === selectedCustomer);
        const newRateList: Omit<RateList, 'id'> = {
            name: `${quotationNo}-${selectedCustomer}`,
            isStandard: false,
            customerIds: customer ? [customer.id] : [],
            stationRates: [],
            itemRates: [],
        };
        const allRateLists = getRateLists();
        const newId = allRateLists.length > 0 ? Math.max(...allRateLists.map(rl => rl.id)) + 1 : 1;
        saveRateLists([...allRateLists, { id: newId, ...newRateList }]);


        // We will replace this with a dialog in the next steps as requested
        router.push('/company/master/rate-list');
    };

    return (
        <main className="flex-1 p-4 md:p-8">
            <header className="mb-4">
                <BackButton />
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <FileSignature className="h-8 w-8" />
                    Generate New Quotation
                </h1>
            </header>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Quotation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Quotation No:</Label>
                            <p className="text-xl font-bold text-red-600">{quotationNo}</p>
                        </div>
                        <div>
                            <Label>Quotation Date</Label>
                            <DatePicker date={quotationDate} setDate={setQuotationDate} />
                        </div>
                    </div>
                    <div>
                        <Label>Select Customer</Label>
                        <Combobox
                            options={customerOptions}
                            value={selectedCustomer}
                            onChange={setSelectedCustomer}
                            placeholder="Search and select a customer..."
                            searchPlaceholder="Search customers..."
                            notFoundMessage="No customer found."
                        />
                    </div>
                    <Button onClick={handleCreateQuotation} size="lg" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Quotation & Add Items
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}


export default function NewQuotationRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <NewQuotationPage />
      </DashboardLayout>
    </Suspense>
  );
}

