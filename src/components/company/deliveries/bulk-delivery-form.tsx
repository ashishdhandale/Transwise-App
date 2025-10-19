
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Layers, FileText } from 'lucide-react';
import { getChallanData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveBookings, getBookings } from '@/lib/bookings-dashboard-data';
import { addHistoryLog } from '@/lib/history-data';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

export function BulkDeliveryForm() {
    const [challanId, setChallanId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [foundChallan, setFoundChallan] = useState<Challan | null>(null);
    const [foundLrs, setFoundLrs] = useState<LrDetail[]>([]);
    const [selectedLrs, setSelectedLrs] = useState<Set<string>>(new Set());
    
    // Delivery confirmation fields
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
    const [receivedBy, setReceivedBy] = useState('');
    const [remarks, setRemarks] = useState('');

    const { toast } = useToast();
    const router = useRouter();

    const handleSearchChallan = () => {
        if (!challanId) return;
        setIsLoading(true);
        // Clear previous results
        setFoundChallan(null);
        setFoundLrs([]);
        setSelectedLrs(new Set());
        
        setTimeout(() => {
            const allChallans = getChallanData();
            const challan = allChallans.find(c => c.challanId.toLowerCase() === challanId.toLowerCase() && c.challanType === 'Dispatch' && c.status === 'Finalized');
            if (challan) {
                const allLrDetails = getLrDetailsData();
                const lrs = allLrDetails.filter(lr => lr.challanId === challan.challanId);
                setFoundChallan(challan);
                setFoundLrs(lrs);
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
        if (!foundChallan || selectedLrs.size === 0 || !deliveryDate || !receivedBy) {
            toast({ title: 'Missing Information', description: 'Please select LRs and fill all delivery details.', variant: 'destructive'});
            return;
        }

        const allBookings = getBookings();
        const deliveryMemoNo = `DM-BLK-${Date.now()}`;
        
        const updatedBookings = allBookings.map(booking => {
            if (selectedLrs.has(booking.lrNo)) {
                addHistoryLog(
                    booking.lrNo,
                    'Delivered',
                    'System (Bulk)',
                    `Delivered via bulk update from Challan #${foundChallan.challanId}. Received by: ${receivedBy}`
                );
                return { 
                    ...booking, 
                    status: 'Delivered' as const,
                    deliveryMemoNo,
                };
            }
            return booking;
        });

        saveBookings(updatedBookings);
        toast({ title: 'Success', description: `${selectedLrs.size} consignments marked as delivered.`});
        router.push('/company/deliveries');
    };
    
    const handleSelectAll = (checked: boolean | string) => {
        if (checked) {
            setSelectedLrs(new Set(foundLrs.map(lr => lr.lrNo)));
        } else {
            setSelectedLrs(new Set());
        }
    };
    
    const handleSelectRow = (lrNo: string) => {
        const newSelection = new Set(selectedLrs);
        if (newSelection.has(lrNo)) {
            newSelection.delete(lrNo);
        } else {
            newSelection.add(lrNo);
        }
        setSelectedLrs(newSelection);
    };

    const totals = useMemo(() => {
        const lrsToTotal = foundLrs.filter(lr => selectedLrs.size > 0 ? selectedLrs.has(lr.lrNo) : true);
        const totalQty = lrsToTotal.reduce((sum, lr) => sum + lr.quantity, 0);
        const totalAmount = lrsToTotal.reduce((sum, lr) => sum + lr.grandTotal, 0);
        return { totalQty, totalAmount, count: lrsToTotal.length };
    }, [foundLrs, selectedLrs]);


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
                        <Input 
                            id="challan-id"
                            value={challanId}
                            onChange={(e) => setChallanId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchChallan()}
                            placeholder="Enter finalized dispatch challan ID..."
                        />
                    </div>
                    <Button onClick={handleSearchChallan} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                        Search
                    </Button>
                </CardContent>
            </Card>

            {foundChallan && (
                 <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Challan Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="font-semibold">Challan No:</span> {foundChallan.challanId}</div>
                            <div><span className="font-semibold">Date:</span> {foundChallan.dispatchDate}</div>
                            <div><span className="font-semibold">Vehicle No:</span> {foundChallan.vehicleNo}</div>
                            <div><span className="font-semibold">To:</span> {foundChallan.toStation}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Consignments in Challan</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="overflow-x-auto border rounded-md max-h-[40vh]">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card z-10">
                                        <TableRow>
                                            <TableHead className={`${thClass} w-12`}>
                                                <Checkbox
                                                    checked={selectedLrs.size > 0 && selectedLrs.size === foundLrs.length}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead className={thClass}>LR No.</TableHead>
                                            <TableHead className={thClass}>From</TableHead>
                                            <TableHead className={thClass}>To</TableHead>
                                            <TableHead className={thClass}>Receiver</TableHead>
                                            <TableHead className={`${thClass} text-right`}>Qty</TableHead>
                                            <TableHead className={`${thClass} text-right`}>Total Amt.</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {foundLrs.map(lr => (
                                            <TableRow 
                                                key={lr.lrNo}
                                                data-state={selectedLrs.has(lr.lrNo) && "selected"}
                                            >
                                                <TableCell className="p-2">
                                                    <Checkbox
                                                        checked={selectedLrs.has(lr.lrNo)}
                                                        onCheckedChange={() => handleSelectRow(lr.lrNo)}
                                                    />
                                                </TableCell>
                                                <TableCell className={`${tdClass} p-2`}>{lr.lrNo}</TableCell>
                                                <TableCell className={`${tdClass} p-2`}>{lr.from}</TableCell>
                                                <TableCell className={`${tdClass} p-2`}>{lr.to}</TableCell>
                                                <TableCell className={`${tdClass} p-2`}>{lr.receiver}</TableCell>
                                                <TableCell className={`${tdClass} p-2 text-right`}>{lr.quantity}</TableCell>
                                                <TableCell className={`${tdClass} p-2 text-right`}>{lr.grandTotal.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                     <TableFooter>
                                        <TableRow className="font-bold bg-muted">
                                            <td colSpan={5} className="p-2 text-right">{selectedLrs.size > 0 ? `Selected Total (${totals.count} LRs):` : `Grand Total (${totals.count} LRs):`}</td>
                                            <td className="p-2 text-right">{totals.totalQty}</td>
                                            <td className="p-2 text-right">{totals.totalAmount.toFixed(2)}</td>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Confirmation Details</CardTitle>
                            <CardDescription>Enter the details for this bulk delivery. This will apply to all selected consignments.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <Label>Delivery Date</Label>
                                <DatePicker date={deliveryDate} setDate={setDeliveryDate} />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="received-by">Received By</Label>
                                <Input
                                    id="received-by"
                                    value={receivedBy}
                                    onChange={(e) => setReceivedBy(e.target.value)}
                                    placeholder="Enter name of person who received the goods"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add any delivery notes or remarks..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleConfirmDelivery} disabled={selectedLrs.size === 0}>
                            <FileText className="mr-2 h-5 w-5"/>
                            Confirm Delivery for {selectedLrs.size} LR(s)
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
