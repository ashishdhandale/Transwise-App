
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, ArrowDown, ArrowUp, Save, Printer, Download, Loader2, Eye, X, Search as SearchIcon, ChevronsUpDown } from 'lucide-react';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, City } from '@/lib/types';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDrivers } from '@/lib/driver-data';
import { getVehicles } from '@/lib/vehicle-data';
import { getCities } from '@/lib/city-data';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSlip } from './loading-slip';
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getVehicleHireReceipts } from '@/lib/vehicle-hire-data';
import { ClientOnly } from '@/components/ui/client-only';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap px-2 py-1 h-9";
const addedTdClass = "whitespace-nowrap px-2 py-1 h-8 text-xs";


const generatePermanentChallanId = (challans: Challan[], prefix: string): string => {
    const relevantChallanIds = challans
        .map(c => c.challanId)
        .filter(id => id.startsWith(prefix) && !id.startsWith('TEMP-'));

    if (relevantChallanIds.length === 0) {
        return `${prefix}01`;
    }

    const lastSequence = relevantChallanIds
        .map(id => parseInt(id.substring(prefix.length), 10))
        .filter(num => !isNaN(num))
        .reduce((max, current) => Math.max(max, current), 0);
        
    const newSequence = lastSequence + 1;
    
    return `${prefix}${String(newSequence).padStart(2, '0')}`;
};

export function NewChallanForm() {
    const [inStockLrs, setInStockLrs] = useState<Booking[]>([]);
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
    const [stockSelection, setStockSelection] = useState<Set<string>>(new Set());
    const [addedSelection, setAddedSelection] = useState<Set<string>>(new Set());
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [isStockVisible, setIsStockVisible] = useState(true);
    
    // Form fields
    const [challanId, setChallanId] = useState('');
    const [dispatchDate, setDispatchDate] = useState<Date | undefined>(undefined);
    const [vehicleNo, setVehicleNo] = useState<string | undefined>(undefined);
    const [driverName, setDriverName] = useState<string | undefined>(undefined);
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [remark, setRemark] = useState('');
    const [hireReceiptNo, setHireReceiptNo] = useState('');
    const [vehicleHireFreight, setVehicleHireFreight] = useState(0);
    const [advance, setAdvance] = useState(0);
    const [balance, setBalance] = useState(0);
    const [commission, setCommission] = useState(0);
    const [labour, setLabour] = useState(0);
    const [crossing, setCrossing] = useState(0);
    const [debitCreditAmount, setDebitCreditAmount] = useState(0);


    // Master data
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [toStationFilter, setToStationFilter] = useState('All');
    const [stockSearchTerm, setStockSearchTerm] = useState('');
    
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    // PDF Preview state
    const printRef = React.useRef<HTMLDivElement>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ challan: Challan, bookings: Booking[] } | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    
    useEffect(() => {
        setBalance(vehicleHireFreight - advance);
    }, [vehicleHireFreight, advance]);

    const totalTopayAmount = useMemo(() => {
        return addedLrs.filter(b => b.lrType === 'TOPAY').reduce((sum, b) => sum + b.totalAmount, 0);
    }, [addedLrs]);

    useEffect(() => {
        const calculatedDebitCredit = totalTopayAmount - (commission + labour + crossing + balance);
        setDebitCreditAmount(calculatedDebitCredit);
    }, [totalTopayAmount, commission, labour, crossing, balance]);

    useEffect(() => {
        if (!searchParams.get('challanId')) {
             setChallanId(`TEMP-CHLN-${Date.now()}`);
        }
        setDispatchDate(new Date());
    }, [searchParams]);

    useEffect(() => {
        const loadInitialData = async () => {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);

            const allBookings = getBookings();
            const allChallans = getChallanData();
            const allCities = getCities();
            
            setVehicles(getVehicles());
            setDrivers(getDrivers());
            setCities(allCities);
            
            const existingChallanId = searchParams.get('challanId');

            if (existingChallanId) {
                setIsStockVisible(false); // Collapse stock section in edit mode
                const existingChallan = allChallans.find(c => c.challanId === existingChallanId);
                const lrDetails = getLrDetailsData().filter(lr => lr.challanId === existingChallanId);
                const addedBookingNos = new Set(lrDetails.map(lr => lr.lrNo));

                if (existingChallan) {
                    setChallanId(existingChallan.challanId);
                    setDispatchDate(new Date(existingChallan.dispatchDate));
                    setVehicleNo(existingChallan.vehicleNo);
                    setDriverName(existingChallan.driverName);
                    setFromStation(allCities.find(c => c.name === existingChallan.fromStation) || null);
                    setToStation(allCities.find(c => c.name === existingChallan.toStation) || null);
                    setRemark(existingChallan.remark || '');
                    setVehicleHireFreight(existingChallan.vehicleHireFreight);
                    setAdvance(existingChallan.advance);
                    setBalance(existingChallan.balance);
                    setCommission(existingChallan.summary.commission || 0);
                    setLabour(existingChallan.summary.labour || 0);
                    setCrossing(existingChallan.summary.crossing || 0);
                    setDebitCreditAmount(existingChallan.summary.debitCreditAmount || 0);

                    const added = allBookings.filter(b => addedBookingNos.has(b.lrNo));
                    const inStock = allBookings.filter(b => b.status === 'In Stock' && !addedBookingNos.has(b.lrNo));
                    
                    setAddedLrs(added);
                    setInStockLrs(inStock);
                }
            } else {
                setInStockLrs(allBookings.filter(b => b.status === 'In Stock'));
                setAddedLrs([]);

                if(profile.city) {
                    const defaultStation = allCities.find((c: City) => c.name.toLowerCase() === profile.city.toLowerCase()) || null;
                    setFromStation(defaultStation);
                }
            }
        };

        loadInitialData();
    }, [searchParams]);

    const handleLoadFromHireReceipt = (receiptNo: string) => {
        setHireReceiptNo(receiptNo);
        if (!receiptNo) {
            // Clear fields if input is empty
            setVehicleNo('');
            setDriverName('');
            setFromStation(null);
            setToStation(null);
            setVehicleHireFreight(0);
            setAdvance(0);
            setBalance(0);
            return;
        }

        const allHireReceipts = getVehicleHireReceipts();
        const receipt = allHireReceipts.find(r => r.receiptNo.toLowerCase() === receiptNo.toLowerCase());
        
        if (receipt) {
            setVehicleNo(receipt.vehicleNo);
            setDriverName(receipt.driverName);
            setFromStation(cities.find(c => c.name.toLowerCase() === receipt.fromStation.toLowerCase()) || null);
            setToStation(cities.find(c => c.name.toLowerCase() === receipt.toStation.toLowerCase()) || null);
            setVehicleHireFreight(receipt.freight);
            setAdvance(receipt.advance);
            setBalance(receipt.balance);
            toast({ title: 'Details Loaded', description: `Details from hire receipt ${receipt.receiptNo} have been loaded.` });
        } else {
            // If not found, clear the details
            setVehicleNo('');
            setDriverName('');
            setVehicleHireFreight(0);
            setAdvance(0);
            setBalance(0);
        }
    };


    const handleAddToChallan = () => {
        const toAdd = inStockLrs.filter(lr => stockSelection.has(lr.trackingId));
        setAddedLrs(prev => [...prev, ...toAdd]);
        setInStockLrs(prev => prev.filter(lr => !stockSelection.has(lr.trackingId)));
        setStockSelection(new Set());
    };

    const handleRemoveFromChallan = () => {
        const toRemove = addedLrs.filter(lr => addedSelection.has(lr.trackingId));
        setInStockLrs(prev => [...prev, ...toRemove]);
        setAddedLrs(prev => prev.filter(lr => !addedSelection.has(lr.trackingId)));
        setAddedSelection(new Set());
    };

    const buildChallanObject = (status: 'Pending' | 'Finalized', newId?: string): { challan: Challan, lrDetails: LrDetail[] } | null => {
        if (!vehicleNo || !driverName || !toStation) {
            toast({ title: "Missing Information", description: "Vehicle, Driver, and To Station are required.", variant: "destructive" });
            return null;
        }

         const challanDataObject: Challan = {
            challanId: newId || challanId,
            dispatchDate: format(dispatchDate!, 'yyyy-MM-dd'),
            challanType: 'Dispatch',
            status,
            vehicleNo,
            driverName,
            fromStation: fromStation?.name || companyProfile?.city || 'N/A',
            toStation: toStation.name,
            dispatchToParty: toStation.name,
            totalLr: addedLrs.length,
            totalPackages: addedLrs.reduce((sum, b) => sum + b.qty, 0),
            totalItems: addedLrs.reduce((sum, b) => sum + (b.itemRows?.length || 0), 0),
            totalActualWeight: addedLrs.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0),
            totalChargeWeight: addedLrs.reduce((sum, b) => sum + b.chgWt, 0),
            vehicleHireFreight,
            advance,
            balance,
            senderId: '', inwardId: '', inwardDate: '', receivedFromParty: '', remark: remark || '',
            summary: {
                grandTotal: addedLrs.reduce((sum, b) => sum + b.totalAmount, 0),
                totalTopayAmount,
                commission,
                labour,
                crossing,
                carting: 0, 
                balanceTruckHire: balance,
                debitCreditAmount,
            }
        };

        const lrDetailsObject: LrDetail[] = addedLrs.map(b => ({
            challanId: newId || challanId,
            lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
            itemDescription: b.itemDescription, quantity: b.qty,
            actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
            chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));

        return { challan: challanDataObject, lrDetails: lrDetailsObject };
    }
    
    const handleSaveAsTemp = () => {
        const data = buildChallanObject('Pending');
        if (!data) return;

        const { challan: tempChallan, lrDetails: tempLrDetails } = data;

        const allChallans = getChallanData();
        const existingChallanIndex = allChallans.findIndex(c => c.challanId === challanId);

        if (existingChallanIndex !== -1) {
            allChallans[existingChallanIndex] = tempChallan;
        } else {
            allChallans.push(tempChallan);
        }
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData();
        allLrDetails = allLrDetails.filter(d => d.challanId !== challanId);
        allLrDetails.push(...tempLrDetails);
        saveLrDetailsData(allLrDetails);

        const allBookings = getBookings();
        const addedLrNos = new Set(tempLrDetails.map(lr => lr.lrNo));

        const updatedBookings = allBookings.map(b => {
             // If a booking is now in the temp challan, set its status to "In Loading"
             if (addedLrNos.has(b.lrNo)) {
                if (b.status !== 'In Loading') {
                    addHistoryLog(b.lrNo, 'In Loading', companyProfile?.companyName || 'System', `Added to temporary challan ${challanId}`);
                    return { ...b, status: 'In Loading' as const };
                }
             }
             // If a booking was previously in this temp challan but is now removed, set back to "In Stock"
             else {
                 const lrDetail = getLrDetailsData().find(l => l.lrNo === b.lrNo);
                 if (lrDetail && lrDetail.challanId === challanId) {
                     addHistoryLog(b.lrNo, 'In Stock', companyProfile?.companyName || 'System', `Removed from temporary challan ${challanId}`);
                     return { ...b, status: 'In Stock' as const };
                 }
             }
             return b;
        });
        saveBookings(updatedBookings);


        toast({ title: "Challan Saved", description: `Temporary challan ${challanId} has been saved.` });
        router.push('/company/challan');
    };

    const handlePreview = () => {
        const data = buildChallanObject('Pending');
        if (!data) return;

        setPreviewData({ challan: data.challan, bookings: addedLrs });
        setIsPreviewOpen(true);
    };


    const handleFinalizeChallan = () => {
        if (addedLrs.length === 0) {
            toast({ title: "No LRs Added", description: "Please add at least one LR to the challan before finalizing.", variant: "destructive" });
            return;
        }

        const challanPrefix = companyProfile?.challanPrefix || 'CHLN';
        const allChallans = getChallanData();
        const newChallanId = generatePermanentChallanId(allChallans, challanPrefix);

        const data = buildChallanObject('Finalized', newChallanId);
        if (!data) return;
        
        const { challan: finalChallan, lrDetails: finalLrDetails } = data;

        const existingChallanIndex = allChallans.findIndex(c => c.challanId === challanId);
        if (existingChallanIndex !== -1) {
            allChallans.splice(existingChallanIndex, 1);
        }
        allChallans.push(finalChallan);
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData();
        allLrDetails = allLrDetails.filter(d => d.challanId !== challanId); // Remove old temp details
        allLrDetails.push(...finalLrDetails);
        saveLrDetailsData(allLrDetails);

        const allBookings = getBookings();
        const addedLrNos = new Set(finalLrDetails.map(lr => lr.lrNo));
        const updatedBookings = allBookings.map(b => {
            if (addedLrNos.has(b.lrNo)) {
                addHistoryLog(b.lrNo, 'In Transit', companyProfile?.companyName || 'System', `Dispatched from ${finalChallan.fromStation} via Challan ${newChallanId}`);
                return { ...b, status: 'In Transit' as const };
            }
            return b;
        });
        saveBookings(updatedBookings);
        
        toast({ title: "Challan Finalized", description: `Challan ${newChallanId} has been saved.` });
        
        setPreviewData({ challan: finalChallan, bookings: addedLrs });
        setIsPreviewOpen(true);
    };
    
    const handlePrintAndClose = () => {
        setIsPreviewOpen(false);
        router.push('/company/challan');
    };
    
    const handleDownloadPdf = async () => {
        const input = printRef.current;
        if (!input || !previewData) return;

        setIsDownloading(true);

        const canvas = await html2canvas(input, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.height / imgProps.width;
        const imgWidth = pdfWidth - 20;
        const imgHeight = imgWidth * ratio;

        let height = imgHeight;
        let position = 10;
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        height -= pdfHeight;

        while (height > 0) {
            position = height - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            height -= pdfHeight;
        }

        pdf.save(`challan-${previewData.challan.challanId}.pdf`);
        setIsDownloading(false);
    };

    const vehicleOptions = useMemo(() => vehicles.map(v => ({ label: v.vehicleNo, value: v.vehicleNo })), [vehicles]);
    const driverOptions = useMemo(() => drivers.map(d => ({ label: d.name, value: d.name })), [drivers]);
    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [cities]);
    
    const stockToStationOptions = useMemo(() => {
        const stations = new Set(inStockLrs.map(lr => lr.toCity));
        return ['All', ...Array.from(stations)];
    }, [inStockLrs]);
    
    const filteredInStockLrs = useMemo(() => {
        let filtered = inStockLrs;

        if (toStationFilter !== 'All') {
            filtered = filtered.filter(lr => lr.toCity === toStationFilter);
        }

        if (stockSearchTerm) {
            const lowerQuery = stockSearchTerm.toLowerCase();
            filtered = filtered.filter(lr => 
                lr.lrNo.toLowerCase().includes(lowerQuery) ||
                lr.sender.toLowerCase().includes(lowerQuery) ||
                lr.receiver.toLowerCase().includes(lowerQuery)
            );
        }
        
        return filtered;
    }, [inStockLrs, toStationFilter, stockSearchTerm]);
    
    const handleStockSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && filteredInStockLrs.length === 1) {
            event.preventDefault();
            const lrToAdd = filteredInStockLrs[0];
            if (lrToAdd.status !== 'In Stock') {
                toast({ title: 'Cannot Add LR', description: `LR# ${lrToAdd.lrNo} has status "${lrToAdd.status}" and cannot be added.`, variant: 'destructive'});
                return;
            }
            setAddedLrs(prev => [...prev, lrToAdd]);
            setInStockLrs(prev => prev.filter(lr => lr.trackingId !== lrToAdd.trackingId));
            setStockSearchTerm('');
        }
    };


    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    New Dispatch Challan
                </h1>
            </header>
            <ClientOnly>
                <Card>
                    <CardHeader>
                        <CardTitle>Challan Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <Label>Challan ID</Label>
                                <Input value={challanId} readOnly className="font-bold text-red-600 bg-red-50 border-red-200" />
                            </div>
                            <div className="space-y-1">
                                <Label>Dispatch Date</Label>
                                <DatePicker date={dispatchDate} setDate={setDispatchDate} />
                            </div>
                            <div className="space-y-1">
                                <Label>Load from Hire Receipt</Label>
                                <Input 
                                    placeholder="Enter Hire Receipt No."
                                    value={hireReceiptNo}
                                    onChange={e => handleLoadFromHireReceipt(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Vehicle No</Label>
                                <Combobox options={vehicleOptions} value={vehicleNo} onChange={setVehicleNo} placeholder="Select Vehicle..." />
                            </div>
                            <div className="space-y-1">
                                <Label>Driver Name</Label>
                                <Combobox options={driverOptions} value={driverName} onChange={setDriverName} placeholder="Select Driver..." />
                            </div>
                            <div className="space-y-1">
                                <Label>From Station</Label>
                                <Combobox options={cityOptions} value={fromStation?.name} onChange={(val) => setFromStation(cities.find(c => c.name === val) || null)} placeholder="Select Origin..." />
                            </div>
                            <div className="space-y-1">
                                <Label>To Station</Label>
                                <Combobox options={cityOptions} value={toStation?.name} onChange={(val) => setToStation(cities.find(c => c.name === val) || null)} placeholder="Select Destination..." />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                 <div className="space-y-4">
                    <Collapsible open={isStockVisible} onOpenChange={setIsStockVisible}>
                        <Card>
                            <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <ChevronsUpDown className="h-4 w-4" />
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CardTitle className="text-base font-headline">LRs In Stock</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-full max-w-xs">
                                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search LR, sender, receiver..."
                                                className="pl-8 h-8 text-xs"
                                                value={stockSearchTerm}
                                                onChange={(e) => setStockSearchTerm(e.target.value)}
                                                onKeyDown={handleStockSearchKeyDown}
                                            />
                                        </div>
                                        <Label htmlFor="to-station-filter" className="text-sm">To Station:</Label>
                                        <Select value={toStationFilter} onValueChange={setToStationFilter}>
                                            <SelectTrigger className="w-[180px] h-8 text-xs" id="to-station-filter">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stockToStationOptions.map(station => (
                                                    <SelectItem key={station} value={station}>{station}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent className="p-0">
                                    <div className="overflow-y-auto h-96 border-t">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-10 sticky top-0 bg-card"><Checkbox onCheckedChange={(c) => handleSelectAll(c as boolean, filteredInStockLrs, (ids) => setStockSelection(ids))} checked={filteredInStockLrs.length > 0 && stockSelection.size === filteredInStockLrs.filter(lr => lr.status === 'In Stock').length && stockSelection.size > 0} /></TableHead>
                                                    <TableHead className="sticky top-0 bg-card">LR No</TableHead>
                                                    <TableHead className="sticky top-0 bg-card">Date</TableHead>
                                                    <TableHead className="sticky top-0 bg-card">To</TableHead>
                                                    <TableHead className="sticky top-0 bg-card">Sender</TableHead>
                                                    <TableHead className="sticky top-0 bg-card">Receiver</TableHead>
                                                    <TableHead className="sticky top-0 bg-card text-right">Packages</TableHead>
                                                    <TableHead className="sticky top-0 bg-card text-right">Charge Wt.</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredInStockLrs.map(lr => (
                                                    <TableRow 
                                                        key={lr.trackingId} 
                                                        data-state={stockSelection.has(lr.trackingId) && "selected"}
                                                        onClick={() => {
                                                            if(lr.status === 'In Stock') {
                                                                handleSelectRow(lr.trackingId, !stockSelection.has(lr.trackingId), stockSelection, setStockSelection)
                                                            }
                                                        }}
                                                        className={lr.status === 'In Stock' ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                                                    >
                                                        <TableCell><Checkbox onCheckedChange={(c) => handleSelectRow(lr.trackingId, c as boolean, stockSelection, setStockSelection)} checked={stockSelection.has(lr.trackingId)} disabled={lr.status !== 'In Stock'} /></TableCell>
                                                        <TableCell>{lr.lrNo}</TableCell>
                                                        <TableCell>{format(new Date(lr.bookingDate), 'dd-MMM')}</TableCell>
                                                        <TableCell>{lr.toCity}</TableCell>
                                                        <TableCell>{lr.sender}</TableCell>
                                                        <TableCell>{lr.receiver}</TableCell>
                                                        <TableCell className="text-right">{lr.qty}</TableCell>
                                                        <TableCell className="text-right">{lr.chgWt.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    <div className="flex flex-col items-center gap-2">
                        <Button onClick={handleAddToChallan} disabled={stockSelection.size === 0}><ArrowDown className="mr-2 h-4 w-4" /> Add to Challan</Button>
                        <Button onClick={handleRemoveFromChallan} disabled={addedSelection.size === 0} variant="outline"><ArrowUp className="mr-2 h-4 w-4" /> Remove</Button>
                    </div>

                    {/* LRs Added to Challan Table */}
                    <Card className="h-full flex flex-col">
                        <CardHeader className="p-4">
                            <CardTitle className="text-base font-headline">LRs Added to Challan</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow">
                             <div className="overflow-y-auto h-60 border-t">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10 sticky top-0 bg-card"><Checkbox onCheckedChange={(c) => handleSelectAll(c as boolean, addedLrs, (ids) => setAddedSelection(ids))} checked={addedLrs.length > 0 && addedSelection.size === addedLrs.length} /></TableHead>
                                            <TableHead className="sticky top-0 bg-card">LR No</TableHead>
                                            <TableHead className="sticky top-0 bg-card">To</TableHead>
                                            <TableHead className="sticky top-0 bg-card text-right">Packages</TableHead>
                                            <TableHead className="sticky top-0 bg-card text-right">Charge Wt.</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {addedLrs.map(lr => (
                                            <TableRow 
                                                key={lr.trackingId} 
                                                data-state={addedSelection.has(lr.trackingId) && "selected"}
                                                onClick={() => handleSelectRow(lr.trackingId, !addedSelection.has(lr.trackingId), addedSelection, setAddedSelection)}
                                                className="cursor-pointer"
                                            >
                                                <TableCell><Checkbox onCheckedChange={(c) => handleSelectRow(lr.trackingId, c as boolean, addedSelection, setAddedSelection)} checked={addedSelection.has(lr.trackingId)} /></TableCell>
                                                <TableCell>{lr.lrNo}</TableCell>
                                                <TableCell>{lr.toCity}</TableCell>
                                                <TableCell className="text-right">{lr.qty}</TableCell>
                                                <TableCell className="text-right">{lr.chgWt.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 p-4 border rounded-md bg-muted/50">
                    <div className="space-y-1">
                        <Label>Vehicle Hire Freight</Label>
                        <Input value={vehicleHireFreight} onChange={(e) => setVehicleHireFreight(Number(e.target.value))} className="font-semibold" />
                    </div>
                    <div className="space-y-1">
                        <Label>Advance Paid</Label>
                        <Input value={advance} onChange={(e) => setAdvance(Number(e.target.value))} className="font-semibold" />
                    </div>
                    <div className="space-y-1">
                        <Label>Balance</Label>
                        <Input value={balance} readOnly className="font-bold text-green-700" />
                    </div>
                    <div className="space-y-1">
                        <Label>Commission</Label>
                        <Input value={commission} onChange={(e) => setCommission(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                        <Label>Labour</Label>
                        <Input value={labour} onChange={(e) => setLabour(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                        <Label>Crossing</Label>
                        <Input value={crossing} onChange={(e) => setCrossing(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                        <Label>Debit/Credit Amt</Label>
                        <Input value={debitCreditAmount.toFixed(2)} readOnly className="font-bold text-blue-700" />
                    </div>
                    <div className="lg:col-span-full space-y-1">
                        <Label>Remarks / Dispatch Note</Label>
                        <Textarea placeholder="Add any special instructions for this dispatch..." value={remark} onChange={(e) => setRemark(e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button onClick={handleSaveAsTemp} variant="outline"><Save className="mr-2 h-4 w-4" /> Save as Temp & Exit</Button>
                    <Button onClick={handlePreview} variant="secondary"><Eye className="mr-2 h-4 w-4" /> Preview Loading Slip</Button>
                    <Button onClick={handleFinalizeChallan} size="lg"><Save className="mr-2 h-4 w-4" /> Finalize & Save Challan</Button>
                    <Button onClick={() => router.push('/company/challan')} variant="destructive"><X className="mr-2 h-4 w-4" /> Exit Without Saving</Button>
                </div>
                
                {previewData && companyProfile && (
                    <Dialog open={isPreviewOpen} onOpenChange={(isOpen) => {
                        if (!isOpen && previewData.challan.status === 'Finalized') {
                            handlePrintAndClose();
                        } else {
                            setIsPreviewOpen(isOpen);
                        }
                    }}>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {previewData.challan.status === 'Finalized' ? 'Challan Finalized' : 'Loading Slip Preview'}: {previewData.challan.challanId}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
                                <div ref={printRef} className="bg-white">
                                    <LoadingSlip 
                                        challan={previewData.challan} 
                                        bookings={previewData.bookings}
                                        profile={companyProfile}
                                        driverMobile={drivers.find(d => d.name === previewData.challan.driverName)?.mobile}
                                        remark={previewData.challan.remark || ''}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
                                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                    Download PDF
                                </Button>
                                <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                                {previewData.challan.status === 'Finalized' && (
                                    <Button onClick={handlePrintAndClose}>Done & Exit</Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </ClientOnly>
        </div>
    );
}

// Helper functions for table selection
function handleSelectAll(checked: boolean, data: { trackingId: string, status: string }[], setSelection: (ids: Set<string>) => void) {
    if (checked) {
        const stockToSelect = data.filter(item => item.status === 'In Stock');
        setSelection(new Set(stockToSelect.map(item => item.trackingId)));
    } else {
        setSelection(new Set());
    }
}

function handleSelectRow(id: string, checked: boolean, currentSelection: Set<string>, setSelection: (ids: Set<string>) => void) {
    const newSelection = new Set(currentSelection);
    if (checked) {
        newSelection.add(id);
    } else {
        newSelection.delete(id);
    }
    setSelection(newSelection);
}
