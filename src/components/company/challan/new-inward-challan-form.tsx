
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Save, X, PlusCircle, Trash2, Search, ArrowRight } from 'lucide-react';
import type { Challan, LrDetail } from '@/lib/challan-data';
import { getChallanData, saveChallanData, getLrDetailsData, saveLrDetailsData } from '@/lib/challan-data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
import { addHistoryLog } from '@/lib/history-data';


let manualLrId = 0;

const createEmptyManualLr = (): LrDetail & { manualId: number } => ({
    manualId: manualLrId++,
    challanId: '',
    lrNo: '',
    lrType: 'TOPAY',
    sender: '',
    receiver: '',
    from: '',
    to: '',
    bookingDate: new Date().toISOString().split('T')[0],
    itemDescription: '',
    quantity: 0,
    actualWeight: 0,
    chargeWeight: 0,
    grandTotal: 0,
});


export function NewInwardChallanForm() {
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [allDispatchChallans, setAllDispatchChallans] = useState<Challan[]>([]);
    
    // Inward details
    const [inwardChallanId, setInwardChallanId] = useState('');
    const [inwardDate, setInwardDate] = useState<Date | undefined>(new Date());
    const [receivedFrom, setReceivedFrom] = useState('');
    const [originalChallanNo, setOriginalChallanNo] = useState('');
    const [originalChallanDate, setOriginalChallanDate] = useState<Date | undefined>(new Date());
    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [fromStation, setFromStation] = useState('');
    
    // Manual LR Entry
    const [manualLrs, setManualLrs] = useState<(LrDetail & { manualId: number })[]>([createEmptyManualLr()]);
    
    // Import from System
    const [importQuery, setImportQuery] = useState('');
    const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
    const [selectedChallanLrs, setSelectedChallanLrs] = useState<LrDetail[]>([]);

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            const allChallans = getChallanData();
            setAllDispatchChallans(allChallans.filter(c => c.challanType === 'Dispatch' && c.status === 'Finalized'));
            
            const nextId = (allChallans.filter(c => c.challanType === 'Inward').length) + 1;
            setInwardChallanId(`INW-${String(nextId).padStart(4, '0')}`);
        }
        loadData();
    }, []);

    const handleSearchChallan = () => {
        const found = allDispatchChallans.find(c => c.challanId.toLowerCase() === importQuery.toLowerCase());
        if (found) {
            setSelectedChallan(found);
            const lrs = getLrDetailsData().filter(lr => lr.challanId === found.challanId);
            setSelectedChallanLrs(lrs);
            // Pre-fill fields from the dispatch challan
            setReceivedFrom(found.fromStation);
            setOriginalChallanNo(found.challanId);
            setOriginalChallanDate(new Date(found.dispatchDate));
            setVehicleNo(found.vehicleNo);
            setDriverName(found.driverName);
            setFromStation(found.fromStation);
        } else {
            toast({ title: 'Not Found', description: 'Dispatch challan not found.', variant: 'destructive' });
            setSelectedChallan(null);
            setSelectedChallanLrs([]);
        }
    };
    
    const handleManualLrChange = (index: number, field: keyof LrDetail, value: any) => {
        const updatedLrs = [...manualLrs];
        (updatedLrs[index] as any)[field] = value;
        setManualLrs(updatedLrs);
    };

    const addManualLrRow = () => {
        setManualLrs(prev => [...prev, createEmptyManualLr()]);
    };

    const removeManualLrRow = (id: number) => {
        setManualLrs(prev => prev.filter(lr => lr.manualId !== id));
    };

    const handleSaveInwardChallan = (mode: 'manual' | 'import') => {
        const toStation = companyProfile?.city || 'N/A';
        
        let lrsToSave: LrDetail[] = [];
        if (mode === 'manual') {
            lrsToSave = manualLrs.map(({ manualId, ...rest }) => ({...rest, challanId: inwardChallanId }));
        } else if (mode === 'import' && selectedChallan) {
            lrsToSave = selectedChallanLrs.map(lr => ({...lr, challanId: inwardChallanId, from: fromStation, to: toStation }));
        }

        if (lrsToSave.length === 0) {
            toast({ title: 'Error', description: 'No LRs to process.', variant: 'destructive' });
            return;
        }

        const newInwardChallan: Challan = {
            challanId: inwardChallanId,
            challanType: 'Inward',
            dispatchDate: format(inwardDate!, 'yyyy-MM-dd'),
            inwardDate: format(inwardDate!, 'yyyy-MM-dd'),
            status: 'Finalized',
            vehicleNo,
            driverName,
            fromStation,
            toStation,
            totalLr: lrsToSave.length,
            totalPackages: lrsToSave.reduce((sum, lr) => sum + lr.quantity, 0),
            totalChargeWeight: lrsToSave.reduce((sum, lr) => sum + lr.chargeWeight, 0),
            receivedFromParty: receivedFrom,
            // These fields are less relevant for inward challans but need defaults
            dispatchToParty: '', totalItems: 0, totalActualWeight: 0, vehicleHireFreight: 0, advance: 0, balance: 0, senderId: '', inwardId: '', summary: { grandTotal: 0, totalTopayAmount: 0, commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0 }
        };
        
        const allChallans = getChallanData();
        saveChallanData([...allChallans, newInwardChallan]);
        
        const allLrDetails = getLrDetailsData();
        saveLrDetailsData([...allLrDetails, ...lrsToSave]);

        if (mode === 'import') {
            // Update the status of original bookings
            const lrNumbers = new Set(lrsToSave.map(lr => lr.lrNo));
            const allBookings = getBookings();
            const updatedBookings = allBookings.map(b => {
                if (lrNumbers.has(b.lrNo)) {
                    addHistoryLog(b.lrNo, 'In Stock', 'System', `Arrived at ${toStation} via Inward Challan ${inwardChallanId}`);
                    return { ...b, status: 'In Stock' as const };
                }
                return b;
            });
            saveBookings(updatedBookings);
        }

        toast({ title: 'Success', description: `Inward Challan ${inwardChallanId} has been created.` });
        router.push('/company/challan');
    };

    return (
      <div className="space-y-4">
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-8 w-8" />
                New Inward Challan
            </h1>
        </header>

        <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="import">Import from System</TabsTrigger>
            </TabsList>
            
            {/* Manual Entry Tab */}
            <TabsContent value="manual">
                <Card>
                    <CardHeader><CardTitle>Manual Inward Entry</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <Label>Inward Challan ID</Label>
                                <Input value={inwardChallanId} readOnly className="font-bold bg-muted" />
                            </div>
                             <div className="space-y-1">
                                <Label>Inward Date</Label>
                                <DatePicker date={inwardDate} setDate={setInwardDate} />
                            </div>
                             <div className="space-y-1">
                                <Label>Received From</Label>
                                <Input value={receivedFrom} onChange={(e) => setReceivedFrom(e.target.value)} placeholder="Party / Branch Name"/>
                            </div>
                             <div className="space-y-1">
                                <Label>Vehicle No.</Label>
                                <Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
                            </div>
                             <div className="space-y-1">
                                <Label>Original Challan No.</Label>
                                <Input value={originalChallanNo} onChange={(e) => setOriginalChallanNo(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Original Challan Date</Label>
                                <DatePicker date={originalChallanDate} setDate={setOriginalChallanDate} />
                            </div>
                             <div className="space-y-1">
                                <Label>From Station</Label>
                                <Input value={fromStation} onChange={(e) => setFromStation(e.target.value)} />
                            </div>
                        </div>
                        
                        <div className="pt-4 space-y-2">
                            <h3 className="font-semibold text-lg">Goods Details (Manual)</h3>
                            <div className="overflow-x-auto border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>LR No</TableHead>
                                            <TableHead>Consignor</TableHead>
                                            <TableHead>Consignee</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {manualLrs.map((lr, index) => (
                                            <TableRow key={lr.manualId}>
                                                <TableCell><Input value={lr.lrNo} onChange={e => handleManualLrChange(index, 'lrNo', e.target.value)}/></TableCell>
                                                <TableCell><Input value={lr.sender} onChange={e => handleManualLrChange(index, 'sender', e.target.value)}/></TableCell>
                                                <TableCell><Input value={lr.receiver} onChange={e => handleManualLrChange(index, 'receiver', e.target.value)}/></TableCell>
                                                <TableCell><Input value={lr.itemDescription} onChange={e => handleManualLrChange(index, 'itemDescription', e.target.value)}/></TableCell>
                                                <TableCell><Input type="number" value={lr.quantity} onChange={e => handleManualLrChange(index, 'quantity', e.target.value)}/></TableCell>
                                                <TableCell><Input type="number" value={lr.chargeWeight} onChange={e => handleManualLrChange(index, 'chargeWeight', e.target.value)}/></TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeManualLrRow(lr.manualId)} disabled={manualLrs.length <= 1}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                             <Button type="button" variant="outline" size="sm" onClick={addManualLrRow}><PlusCircle className="mr-2 h-4 w-4"/>Add Row</Button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="destructive" type="button" onClick={() => router.push('/company/challan')}><X className="mr-2 h-4 w-4"/>Cancel</Button>
                            <Button onClick={() => handleSaveInwardChallan('manual')}><Save className="mr-2 h-4 w-4"/>Save Inward Challan</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Import Tab */}
            <TabsContent value="import">
                <Card>
                    <CardHeader><CardTitle>Import from Dispatch Challan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Input value={importQuery} onChange={e => setImportQuery(e.target.value)} placeholder="Enter Dispatch Challan ID to import..." />
                            <Button onClick={handleSearchChallan}><Search className="mr-2 h-4 w-4"/>Search</Button>
                        </div>
                        
                        {selectedChallan && (
                            <div className="p-4 border rounded-md bg-muted/50 space-y-4">
                                <h3 className="font-semibold text-lg">Dispatch Details</h3>
                                <div className="grid grid-cols-4 gap-2 text-sm">
                                    <p><span className="font-medium">From:</span> {selectedChallan.fromStation}</p>
                                    <p><span className="font-medium">To:</span> {selectedChallan.toStation}</p>
                                    <p><span className="font-medium">Vehicle:</span> {selectedChallan.vehicleNo}</p>
                                    <p><span className="font-medium">Date:</span> {selectedChallan.dispatchDate}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">LRs in this Challan ({selectedChallanLrs.length})</h4>
                                    <div className="overflow-auto border rounded-md max-h-60">
                                         <Table>
                                            <TableHeader><TableRow><TableHead>LR No</TableHead><TableHead>To</TableHead><TableHead>Receiver</TableHead><TableHead>Qty</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {selectedChallanLrs.map(lr => (
                                                    <TableRow key={lr.lrNo}>
                                                        <TableCell>{lr.lrNo}</TableCell>
                                                        <TableCell>{lr.to}</TableCell>
                                                        <TableCell>{lr.receiver}</TableCell>
                                                        <TableCell>{lr.quantity}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                 <div className="flex justify-center pt-4">
                                    <Button onClick={() => handleSaveInwardChallan('import')} size="lg">
                                        Confirm & Receive these Items
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    );
}
