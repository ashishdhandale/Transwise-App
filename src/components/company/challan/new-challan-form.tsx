
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
import { FileText, ArrowDown, ArrowUp, Save, Printer, Download, Loader2 } from 'lucide-react';
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
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { LoadingSlip } from './loading-slip';
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap px-2 py-1 h-9";

const generateChallanId = (challans: Challan[], prefix: string): string => {
    const relevantChallanIds = challans
        .map(c => c.challanId)
        .filter(id => id.startsWith(prefix));

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
    
    // Form fields
    const [challanId, setChallanId] = useState('');
    const [dispatchDate, setDispatchDate] = useState<Date | undefined>(new Date());
    const [vehicleNo, setVehicleNo] = useState<string | undefined>(undefined);
    const [driverName, setDriverName] = useState<string | undefined>(undefined);
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [remark, setRemark] = useState('');


    // Master data
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    // PDF Preview state
    const printRef = React.useRef<HTMLDivElement>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ challan: Challan, lrDetails: LrDetail[] } | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    

    const loadInitialData = useCallback(async (existingChallanId?: string | null) => {
        const profile = await getCompanyProfile();
        setCompanyProfile(profile);

        const allBookings = getBookings();
        const allChallans = getChallanData();
        const allCities = getCities();
        
        setVehicles(getVehicles());
        setDrivers(getDrivers());
        setCities(allCities);

        if (existingChallanId) {
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

                const added = allBookings.filter(b => addedBookingNos.has(b.lrNo));
                const inStock = allBookings.filter(b => b.status === 'In Stock' && !addedBookingNos.has(b.lrNo));
                
                setAddedLrs(added);
                setInStockLrs(inStock);
            }
        } else {
            const challanPrefix = profile?.challanPrefix || 'CHLN';
            setChallanId(generateChallanId(allChallans, challanPrefix));
            setInStockLrs(allBookings.filter(b => b.status === 'In Stock'));
            setAddedLrs([]);

            if(profile.city) {
                const defaultStation = allCities.find((c: City) => c.name.toLowerCase() === profile.city.toLowerCase()) || null;
                setFromStation(defaultStation);
            }
        }
    }, []);

    useEffect(() => {
        const challanIdParam = searchParams.get('challanId');
        loadInitialData(challanIdParam);
    }, [searchParams, loadInitialData]);

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
    
    const handleFinalizeChallan = () => {
        if (!vehicleNo || !driverName || !toStation || addedLrs.length === 0) {
            toast({ title: "Missing Information", description: "Please provide Vehicle, Driver, To Station and add at least one LR.", variant: "destructive" });
            return;
        }

        const allChallans = getChallanData();
        const existingChallanIndex = allChallans.findIndex(c => c.challanId === challanId);

        const newChallanData: Challan = {
            challanId,
            dispatchDate: format(dispatchDate!, 'yyyy-MM-dd'),
            challanType: 'Dispatch',
            status: 'Finalized',
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
            vehicleHireFreight: existingChallanIndex !== -1 ? allChallans[existingChallanIndex].vehicleHireFreight : 0, 
            advance: existingChallanIndex !== -1 ? allChallans[existingChallanIndex].advance : 0,
            balance: existingChallanIndex !== -1 ? allChallans[existingChallanIndex].balance : 0,
            senderId: '', inwardId: '', inwardDate: '', receivedFromParty: '', remark,
            summary: {
                grandTotal: addedLrs.reduce((sum, b) => sum + b.totalAmount, 0),
                totalTopayAmount: addedLrs.filter(b => b.lrType === 'TOPAY').reduce((sum, b) => sum + b.totalAmount, 0),
                commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0,
            }
        };
        
        if (existingChallanIndex !== -1) {
            allChallans[existingChallanIndex] = newChallanData;
        } else {
            allChallans.push(newChallanData);
        }
        saveChallanData(allChallans);

        const newLrDetails: LrDetail[] = addedLrs.map(b => ({
            challanId,
            lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
            itemDescription: b.itemDescription, quantity: b.qty,
            actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
            chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));
        
        let allLrDetails = getLrDetailsData();
        // Remove old details for this challan and add the new ones
        allLrDetails = allLrDetails.filter(d => d.challanId !== challanId);
        allLrDetails.push(...newLrDetails);
        saveLrDetailsData(allLrDetails);

        const allBookings = getBookings();
        const updatedBookings = allBookings.map(b => {
            const wasAdded = addedLrs.some(addedLr => addedLr.trackingId === b.trackingId);
            if (wasAdded && b.status !== 'In Transit') {
                addHistoryLog(b.lrNo, 'In Transit', companyProfile?.companyName || 'System', `Dispatched via Challan ${challanId}`);
                return { ...b, status: 'In Transit' as const };
            }
            return b;
        });
        saveBookings(updatedBookings);
        
        toast({ title: "Challan Finalized", description: `Challan ${challanId} has been saved.` });
        
        setPreviewData({ challan: newChallanData, lrDetails: newLrDetails });
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

    const renderTable = (title: string, data: Booking[], selection: Set<string>, onSelect: (id: string, checked: boolean) => void, onSelectAll: (checked: boolean) => void) => (
        <Card className="h-full flex flex-col">
            <CardHeader className="p-3">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <div className="overflow-y-auto h-96 border-t">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10 sticky top-0 bg-card"><Checkbox onCheckedChange={(c) => onSelectAll(c as boolean)} checked={data.length > 0 && selection.size === data.length} /></TableHead>
                                <TableHead className="sticky top-0 bg-card">LR No</TableHead>
                                <TableHead className="sticky top-0 bg-card">To</TableHead>
                                <TableHead className="sticky top-0 bg-card">Packages</TableHead>
                                <TableHead className="sticky top-0 bg-card">Charge Wt.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(lr => (
                                <TableRow key={lr.trackingId}>
                                    <TableCell><Checkbox onCheckedChange={(c) => onSelect(lr.trackingId, c as boolean)} checked={selection.has(lr.trackingId)} /></TableCell>
                                    <TableCell>{lr.lrNo}</TableCell>
                                    <TableCell>{lr.toCity}</TableCell>
                                    <TableCell>{lr.qty}</TableCell>
                                    <TableCell>{lr.chgWt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    New Dispatch Challan
                </h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Challan Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                        <Label>Challan ID</Label>
                        <Input value={challanId} readOnly className="font-bold text-red-600 bg-red-50 border-red-200" />
                    </div>
                    <div className="space-y-1">
                        <Label>Dispatch Date</Label>
                        <DatePicker date={dispatchDate} setDate={setDispatchDate} />
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
                     <div className="md:col-span-2 lg:col-span-3 space-y-1">
                        <Label>Remarks / Dispatch Note</Label>
                        <Textarea placeholder="Add any special instructions for this dispatch..." value={remark} onChange={(e) => setRemark(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {renderTable('LRs In Stock', inStockLrs, stockSelection, (id, checked) => {
                    const newSelection = new Set(stockSelection);
                    if (checked) newSelection.add(id); else newSelection.delete(id);
                    setStockSelection(newSelection);
                }, (checked) => {
                    if (checked) setStockSelection(new Set(inStockLrs.map(lr => lr.trackingId))); else setStockSelection(new Set());
                })}

                <div className="flex flex-col gap-2">
                    <Button onClick={handleAddToChallan} disabled={stockSelection.size === 0}><ArrowDown className="mr-2 h-4 w-4" /> Add to Challan</Button>
                    <Button onClick={handleRemoveFromChallan} disabled={addedSelection.size === 0} variant="outline"><ArrowUp className="mr-2 h-4 w-4" /> Remove from Challan</Button>
                </div>

                {renderTable('LRs Added to Challan', addedLrs, addedSelection, (id, checked) => {
                    const newSelection = new Set(addedSelection);
                    if (checked) newSelection.add(id); else newSelection.delete(id);
                    setAddedSelection(newSelection);
                }, (checked) => {
                    if (checked) setAddedSelection(new Set(addedLrs.map(lr => lr.trackingId))); else setAddedSelection(new Set());
                })}
            </div>
            
            <div className="flex justify-end">
                <Button onClick={handleFinalizeChallan} size="lg"><Save className="mr-2 h-4 w-4" /> Finalize & Save Challan</Button>
            </div>
            
            {previewData && companyProfile && (
                <Dialog open={isPreviewOpen} onOpenChange={handlePrintAndClose}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Challan Finalized: {previewData.challan.challanId}</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
                            <div ref={printRef} className="bg-white">
                                <LoadingSlip 
                                    challan={previewData.challan} 
                                    lrDetails={previewData.lrDetails} 
                                    profile={companyProfile}
                                    driverMobile={drivers.find(d => d.name === previewData.challan.driverName)?.mobile}
                                    remark={previewData.challan.remark}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={handlePrintAndClose}>Close</Button>
                            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download PDF
                            </Button>
                            <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
