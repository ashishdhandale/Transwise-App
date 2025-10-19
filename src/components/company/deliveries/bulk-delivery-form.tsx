
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Layers, FileText, Undo2, Upload } from 'lucide-react';
import { getChallanData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { saveBookings, getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { addHistoryLog } from '@/lib/history-data';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ClientOnly } from '@/components/ui/client-only';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

const SummaryItem = ({ label, value }: { label: string; value?: string | number }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground uppercase">{label}</p>
        <p className="font-semibold uppercase">{value || 'N/A'}</p>
    </div>
);

type DeliveryItemStatus = 'Delivered' | 'Return';
type DeliveryPaymentMode = 'Cash' | 'Online' | 'Cheque';

interface DeliveryItem extends LrDetail {
    deliveryStatus: DeliveryItemStatus;
    deliveryDate: Date;
    receivedBy: string;
    remarks: string;
    podFile?: File | null;
    podFileName?: string;
    deliveryPaymentMode?: DeliveryPaymentMode;
}

export function BulkDeliveryForm() {
    const [challanId, setChallanId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [foundChallan, setFoundChallan] = useState<Challan | null>(null);
    const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
    const [selectedLrs, setSelectedLrs] = useState<Set<string>>(new Set());

    const { toast } = useToast();
    const router = useRouter();
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});


    const handleSearchChallan = () => {
        if (!challanId) return;
        setIsLoading(true);
        setFoundChallan(null);
        setDeliveryItems([]);
        setSelectedLrs(new Set());
        
        setTimeout(() => {
            const allChallans = getChallanData();
            const challan = allChallans.find(c => c.challanId.toLowerCase() === challanId.toLowerCase() && c.challanType === 'Dispatch' && c.status === 'Finalized');
            if (challan) {
                const allLrDetails = getLrDetailsData();
                const lrs = allLrDetails.filter(lr => lr.challanId === challan.challanId);
                const items: DeliveryItem[] = lrs.map(lr => ({
                    ...lr,
                    deliveryStatus: 'Delivered',
                    deliveryDate: new Date(),
                    receivedBy: '',
                    remarks: '',
                    podFile: null,
                    podFileName: '',
                }));
                setFoundChallan(challan);
                setDeliveryItems(items);
            } else {
                toast({
                    title: 'Not Found',
                    description: 'No finalized dispatch challan found with that ID.',
                    variant: 'destructive',
                });
            }
            setIsLoading(false);
        }, 500);
    };

    const handleConfirmDelivery = () => {
        if (!foundChallan || selectedLrs.size === 0) {
            toast({ title: 'Missing Information', description: 'Please select LRs to confirm.', variant: 'destructive'});
            return;
        }

        const itemsToProcess = deliveryItems.filter(item => selectedLrs.has(item.lrNo));
        const invalidItems = itemsToProcess.filter(item => item.deliveryStatus === 'Delivered' && (!item.receivedBy || !item.deliveryDate));
        if (invalidItems.length > 0) {
            toast({ title: 'Missing Details', description: 'Please fill "Received By" and "Delivery Date" for all selected delivered items.', variant: 'destructive'});
            return;
        }

        const allBookings = getBookings();
        const updatedBookings = [...allBookings];
        const deliveryMemoNo = `DM-BLK-${Date.now()}`;
        
        itemsToProcess.forEach(item => {
            const bookingIndex = updatedBookings.findIndex(b => b.lrNo === item.lrNo);
            if (bookingIndex === -1) return;

            if (item.deliveryStatus === 'Delivered') {
                addHistoryLog(item.lrNo, 'Delivered', 'System (Bulk)', `Delivered via bulk update from Challan #${foundChallan.challanId}. Received by: ${item.receivedBy}. Remarks: ${item.remarks}`);
                updatedBookings[bookingIndex] = { ...updatedBookings[bookingIndex], status: 'Delivered', deliveryMemoNo };
            } else { // Return
                addHistoryLog(item.lrNo, 'In Stock', 'System (Bulk)', `Returned to stock via bulk update from Challan #${foundChallan.challanId}. Remarks: ${item.remarks}`);
                updatedBookings[bookingIndex] = { ...updatedBookings[bookingIndex], status: 'In Stock' };
            }
        });

        saveBookings(updatedBookings);
        toast({ title: 'Success', description: `${selectedLrs.size} consignments have been processed.`});
        router.push('/company/deliveries');
    };
    
    const handleSelectAll = (checked: boolean | string) => {
        setSelectedLrs(checked ? new Set(deliveryItems.map(lr => lr.lrNo)) : new Set());
    };
    
    const handleSelectRow = (lrNo: string) => {
        const newSelection = new Set(selectedLrs);
        newSelection.has(lrNo) ? newSelection.delete(lrNo) : newSelection.add(lrNo);
        setSelectedLrs(newSelection);
    };
    
    const handleItemChange = (lrNo: string, field: keyof DeliveryItem, value: any) => {
        setDeliveryItems(prev => prev.map(item => item.lrNo === lrNo ? { ...item, [field]: value } : item));
    };

    const handleFileChange = (lrNo: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setDeliveryItems(prev => prev.map(item =>
            item.lrNo === lrNo ? { ...item, podFile: file, podFileName: file?.name || '' } : item
        ));
    };

    const totals = useMemo(() => {
        const lrsToTotal = deliveryItems.filter(lr => selectedLrs.size > 0 ? selectedLrs.has(lr.lrNo) : true);
        return { count: lrsToTotal.length };
    }, [deliveryItems, selectedLrs]);


    return (
        <div className="space-y-6">
             <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Layers className="h-8 w-8" />
                    Bulk Challan Delivery
                </h1>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Search Dispatch Challan</CardTitle>
                </CardHeader>
                <CardContent className="flex items-end gap-2">
                    <div className="w-full max-w-sm">
                        <Label htmlFor="challan-id">Challan ID</Label>
                         <ClientOnly>
                            <Input 
                                id="challan-id"
                                value={challanId}
                                onChange={(e) => setChallanId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchChallan()}
                                placeholder="Enter finalized dispatch challan ID..."
                            />
                        </ClientOnly>
                    </div>
                     <ClientOnly>
                        <Button onClick={handleSearchChallan} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                            Search
                        </Button>
                    </ClientOnly>
                </CardContent>
            </Card>

            {foundChallan && (
                 <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Challan Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm uppercase">
                            <SummaryItem label="Challan No" value={foundChallan.challanId} />
                            <SummaryItem label="Date" value={foundChallan.dispatchDate} />
                            <SummaryItem label="Vehicle No" value={foundChallan.vehicleNo} />
                            <SummaryItem label="Driver Name" value={foundChallan.driverName} />
                            <SummaryItem label="From" value={foundChallan.fromStation} />
                            <SummaryItem label="To" value={foundChallan.toStation} />
                            <SummaryItem label="Total LRs" value={foundChallan.totalLr} />
                            <SummaryItem label="Total Packages" value={foundChallan.totalPackages} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Update Delivery Status for Consignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="overflow-x-auto border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className={`${thClass} w-12`}><Checkbox checked={selectedLrs.size > 0 && selectedLrs.size === deliveryItems.length} onCheckedChange={handleSelectAll}/></TableHead>
                                            <TableHead className={thClass}>LR No.</TableHead>
                                            <TableHead className={thClass}>Receiver</TableHead>
                                            <TableHead className={thClass}>Contents</TableHead>
                                            <TableHead className={`${thClass} text-right`}>Qty</TableHead>
                                            <TableHead className={`${thClass} text-right`}>Amount</TableHead>
                                            <TableHead className={thClass}>Status</TableHead>
                                            <TableHead className={thClass}>Payment</TableHead>
                                            <TableHead className={thClass}>Received By</TableHead>
                                            <TableHead className={thClass}>Delivery Date</TableHead>
                                            <TableHead className={thClass}>POD</TableHead>
                                            <TableHead className={thClass}>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deliveryItems.map(item => (
                                            <TableRow key={item.lrNo} data-state={selectedLrs.has(item.lrNo) && "selected"}>
                                                <TableCell className="p-2"><Checkbox checked={selectedLrs.has(item.lrNo)} onCheckedChange={() => handleSelectRow(item.lrNo)}/></TableCell>
                                                <TableCell className={`${tdClass} p-2`}>{item.lrNo}</TableCell>
                                                <TableCell className={`${tdClass} p-2`}>{item.receiver}</TableCell>
                                                <TableCell className={`${tdClass} p-2 max-w-xs truncate`}>{item.itemDescription}</TableCell>
                                                <TableCell className={`${tdClass} p-2 text-right`}>{item.quantity}</TableCell>
                                                <TableCell className={`${tdClass} p-2 text-right`}>{item.grandTotal.toFixed(2)}</TableCell>
                                                <TableCell className="p-2">
                                                    <Select value={item.deliveryStatus} onValueChange={(value) => handleItemChange(item.lrNo, 'deliveryStatus', value)}>
                                                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Delivered">Delivered</SelectItem>
                                                            <SelectItem value="Return">Return</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    {item.lrType === 'TOPAY' ? (
                                                        <Select 
                                                            value={item.deliveryPaymentMode} 
                                                            onValueChange={(value) => handleItemChange(item.lrNo, 'deliveryPaymentMode', value as DeliveryPaymentMode)}
                                                            disabled={item.deliveryStatus === 'Return'}
                                                        >
                                                            <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Cash">Cash</SelectItem>
                                                                <SelectItem value="Online">Online</SelectItem>
                                                                <SelectItem value="Cheque">Cheque</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <span className="text-sm font-semibold">{item.lrType}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Input className="h-8" value={item.receivedBy} onChange={(e) => handleItemChange(item.lrNo, 'receivedBy', e.target.value)} placeholder="Receiver's name" />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <DatePicker date={item.deliveryDate} setDate={(date) => handleItemChange(item.lrNo, 'deliveryDate', date)} />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                     <Button variant="outline" size="sm" className="h-8" onClick={() => fileInputRefs.current[item.lrNo]?.click()}>
                                                        <Upload className="mr-2 h-4 w-4"/> 
                                                        {item.podFileName ? 'Change' : 'Upload'}
                                                     </Button>
                                                     <Input 
                                                        type="file" 
                                                        className="hidden" 
                                                        ref={el => fileInputRefs.current[item.lrNo] = el}
                                                        onChange={(e) => handleFileChange(item.lrNo, e)}
                                                     />
                                                     {item.podFileName && <p className="text-xs text-muted-foreground truncate max-w-20 mt-1">{item.podFileName}</p>}
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Input className="h-8" value={item.remarks} onChange={(e) => handleItemChange(item.lrNo, 'remarks', e.target.value)} placeholder="Optional remarks"/>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleConfirmDelivery} disabled={selectedLrs.size === 0}>
                           {deliveryItems.some(item => selectedLrs.has(item.lrNo) && item.deliveryStatus === 'Return') ? <Undo2 className="mr-2 h-5 w-5"/> : <FileText className="mr-2 h-5 w-5"/>}
                            Confirm & Process {selectedLrs.size} Selected LR(s)
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
