
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { format } from 'date-fns';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

export function BulkDeliveryForm() {
    const [challanId, setChallanId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [foundChallan, setFoundChallan] = useState<Challan | null>(null);
    const [foundLrs, setFoundLrs] = useState<LrDetail[]>([]);
    
    // Delivery confirmation fields
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
    const [receivedBy, setReceivedBy] = useState('');
    const [remarks, setRemarks] = useState('');

    const { toast } = useToast();
    const router = useRouter();

    const handleSearchChallan = () => {
        if (!challanId) return;
        setIsLoading(true);
        setTimeout(() => {
            const allChallans = getChallanData();
            const challan = allChallans.find(c => c.challanId.toLowerCase() === challanId.toLowerCase() && c.challanType === 'Dispatch' && c.status === 'Finalized');
            if (challan) {
                const allLrDetails = getLrDetailsData();
                const lrs = allLrDetails.filter(lr => lr.challanId === challan.challanId);
                setFoundChallan(challan);
                setFoundLrs(lrs);
            } else {
                setFoundChallan(null);
                setFoundLrs([]);
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
        if (!foundChallan || foundLrs.length === 0 || !deliveryDate || !receivedBy) {
            toast({ title: 'Missing Information', description: 'Please fill all delivery details.', variant: 'destructive'});
            return;
        }

        const allBookings = getBookings();
        const lrNosToUpdate = new Set(foundLrs.map(lr => lr.lrNo));
        const deliveryMemoNo = `DM-BLK-${Date.now()}`;
        
        const updatedBookings = allBookings.map(booking => {
            if (lrNosToUpdate.has(booking.lrNo)) {
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
        toast({ title: 'Success', description: `${foundLrs.length} consignments marked as delivered.`});
        router.push('/company/deliveries');
    };

    const totalQty = useMemo(() => foundLrs.reduce((sum, lr) => sum + lr.quantity, 0), [foundLrs]);
    const totalAmount = useMemo(() => foundLrs.reduce((sum, lr) => sum + lr.grandTotal, 0), [foundLrs]);


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
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-card">
                                        <tr>
                                            <th className={thClass}>LR No.</th>
                                            <th className={thClass}>From</th>
                                            <th className={thClass}>To</th>
                                            <th className={thClass}>Receiver</th>
                                            <th className={`${thClass} text-right`}>Qty</th>
                                            <th className={`${thClass} text-right`}>Total Amt.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foundLrs.map(lr => (
                                            <tr key={lr.lrNo}>
                                                <td className={`${tdClass} p-2`}>{lr.lrNo}</td>
                                                <td className={`${tdClass} p-2`}>{lr.from}</td>
                                                <td className={`${tdClass} p-2`}>{lr.to}</td>
                                                <td className={`${tdClass} p-2`}>{lr.receiver}</td>
                                                <td className={`${tdClass} p-2 text-right`}>{lr.quantity}</td>
                                                <td className={`${tdClass} p-2 text-right`}>{lr.grandTotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                     <tfoot>
                                        <tr className="font-bold bg-muted">
                                            <td colSpan={4} className="p-2 text-right">Total</td>
                                            <td className="p-2 text-right">{totalQty}</td>
                                            <td className="p-2 text-right">{totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Confirmation Details</CardTitle>
                            <CardDescription>Enter the details for this bulk delivery. This will apply to all consignments listed above.</CardDescription>
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
                        <Button size="lg" onClick={handleConfirmDelivery}>
                            <FileText className="mr-2 h-5 w-5"/>
                            Confirm Bulk Delivery
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
