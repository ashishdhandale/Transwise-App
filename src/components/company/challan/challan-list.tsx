
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MoreHorizontal, Search, PlusCircle, Pencil, Trash2, CheckCircle, Eye, Calendar as CalendarIcon } from 'lucide-react';
import { getChallanData, type Challan, saveChallanData, getLrDetailsData, saveLrDetailsData } from '@/lib/challan-data';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
import { addHistoryLog } from '@/lib/history-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isWithinInterval } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const thClassPending = "bg-white text-black font-semibold border";
const tdClass = "p-2 whitespace-nowrap";

const thClassFinalized = "bg-cyan-600 text-white font-semibold";


export function ChallanList() {
    const [challans, setChallans] = useState<Challan[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [finalizedFilter, setFinalizedFilter] = useState<'Both' | 'Dispatch' | 'Inward'>('Both');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const { toast } = useToast();
    const router = useRouter();

    const loadChallans = () => {
        setChallans(getChallanData());
    };

    useEffect(() => {
        async function loadData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            loadChallans();
        }
        loadData();
    }, []);

    const { pendingChallans, finalizedChallans } = useMemo(() => {
        const pending = challans.filter(c => c.status === 'Pending')
            .sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
            
        let finalized = challans.filter(c => c.status === 'Finalized');
        
        if (finalizedFilter !== 'Both') {
            finalized = finalized.filter(c => c.challanType === finalizedFilter);
        }

        if (dateRange?.from && dateRange?.to) {
            finalized = finalized.filter(c => {
                try {
                    const dispatchDate = parseISO(c.dispatchDate);
                    return isWithinInterval(dispatchDate, { start: dateRange.from!, end: dateRange.to! });
                } catch (e) {
                    return false;
                }
            });
        }
        
        finalized.sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());

        return { pendingChallans: pending, finalizedChallans: finalized };
    }, [challans, finalizedFilter, dateRange]);

    const handleFinalize = (challanIdToFinalize: string) => {
        const allChallans = getChallanData();
        const challanExists = allChallans.some(c => c.challanId === challanIdToFinalize);
        
        if (!challanExists) {
            toast({ title: "Error", description: `Challan ${challanIdToFinalize} not found.`, variant: "destructive" });
            return;
        }

        const updatedChallans = allChallans.map(c => {
            if (c.challanId === challanIdToFinalize) {
                const newId = c.challanId.startsWith('TEMP-') ? c.challanId.replace('TEMP-', '') : c.challanId;
                toast({ title: "Challan Finalized", description: `Challan ${newId} has been finalized.` });
                return { ...c, status: 'Finalized' as const, challanId: newId };
            }
            return c;
        });
        
        saveChallanData(updatedChallans);
        loadChallans();
    };
    
    const handleDelete = (challanId: string) => {
        const allLrDetails = getLrDetailsData();
        const lrsOnChallan = allLrDetails.filter(lr => lr.challanId === challanId);
        const lrNumbersToRevert = lrsOnChallan.map(lr => lr.lrNo);

        if (lrNumbersToRevert.length > 0) {
            const allBookings = getBookings();
            const updatedBookings = allBookings.map(booking => {
                if (lrNumbersToRevert.includes(booking.lrNo)) {
                    addHistoryLog(booking.lrNo, 'Booking Updated', 'System', `Removed from deleted challan ${challanId}. Status reverted to In Stock.`);
                    return { ...booking, status: 'In Stock' as const };
                }
                return booking;
            });
            saveBookings(updatedBookings);
        }

        const remainingLrDetails = allLrDetails.filter(lr => lr.challanId !== challanId);
        saveLrDetailsData(remainingLrDetails);
        
        const updatedChallans = getChallanData().filter(c => c.challanId !== challanId);
        saveChallanData(updatedChallans);
        
        loadChallans();
        toast({ title: "Challan Deleted", description: `Associated LRs have been returned to stock.`, variant: "destructive" });
    }

    const formatValue = (amount: number) => {
        if (!companyProfile) return amount.toLocaleString();
        return amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between">
                 <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    Challan Management
                </h1>
                <div className="flex items-center gap-4">
                     <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
                        <Link href="/company/challan/new">
                            Dispatch Challan
                        </Link>
                    </Button>
                     <Button className="bg-orange-400 hover:bg-orange-500 text-white">
                        Inward Challan
                    </Button>
                     <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                        Import Challan
                    </Button>
                </div>
            </header>
            
            <div className="space-y-6">
                 {/* Pending Challan Table */}
                <div>
                    <h3 className="font-semibold text-gray-600 mb-1 border-b-2 pb-1">Pending Challan</h3>
                    <div className="overflow-x-auto border-2 border-gray-400">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={thClassPending}>Vehicle No.</TableHead>
                                    <TableHead className={thClassPending}>Challan ID</TableHead>
                                    <TableHead className={thClassPending}>Challan Type</TableHead>
                                    <TableHead className={thClassPending}>Destination</TableHead>
                                    <TableHead className={thClassPending}>Creation Date</TableHead>
                                    <TableHead className={thClassPending}>Total Weight</TableHead>
                                    <TableHead className={thClassPending}>Driver</TableHead>
                                    <TableHead className={thClassPending}>Bill To Party</TableHead>
                                    <TableHead className={thClassPending}>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingChallans.map(challan => (
                                    <TableRow key={challan.challanId} className="odd:bg-white even:bg-gray-100">
                                        <TableCell className={`${tdClass} border`}>{challan.vehicleNo}</TableCell>
                                        <TableCell className={`${tdClass} border`}>{challan.challanId}</TableCell>
                                        <TableCell className={`${tdClass} border`}>
                                            <span className={cn('font-bold', challan.challanType === 'Dispatch' ? 'text-blue-600' : 'text-purple-600')}>
                                                {challan.challanType.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className={`${tdClass} border`}>{challan.toStation}</TableCell>
                                        <TableCell className={`${tdClass} border`}>{format(parseISO(challan.dispatchDate), 'MM/dd/yy')}</TableCell>
                                        <TableCell className={`${tdClass} border`}>{challan.totalChargeWeight.toFixed(0)} out of {challan.totalActualWeight.toFixed(0)}</TableCell>
                                        <TableCell className={`${tdClass} border`}>{challan.driverName}</TableCell>
                                        <TableCell className={`${tdClass} border`}>{challan.dispatchToParty}</TableCell>
                                        <TableCell className={`${tdClass} border`}>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="h-7" onClick={() => router.push(`/company/challan/new?challanId=${challan.challanId}`)}>
                                                    <Pencil className="mr-1 h-3 w-3" /> Modify
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" className="h-7">
                                                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the pending challan and revert all associated LRs to "In Stock". This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(challan.challanId)}>Delete Challan</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <Button variant="ghost" size="sm" className="h-7 text-green-600" onClick={() => handleFinalize(challan.challanId)}>
                                                    Finalize
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {pendingChallans.length === 0 && (
                            <p className="text-center p-4 text-muted-foreground">No pending challans.</p>
                        )}
                    </div>
                </div>

                {/* Dispatch / Inward Challan List Table */}
                <div>
                    <div className="flex items-center justify-between mb-1 border-b-2 pb-1">
                        <h3 className="font-semibold text-gray-600">Dispatch / Inward Challan List</h3>
                         <div className="flex items-center gap-4">
                            <RadioGroup value={finalizedFilter} onValueChange={(v) => setFinalizedFilter(v as any)} className="flex items-center">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Both" id="both" /><Label htmlFor="both">Both</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Dispatch" id="dispatch" /><Label htmlFor="dispatch">Dispatch</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Inward" id="inward" /><Label htmlFor="inward">Inward</Label></div>
                            </RadioGroup>
                            <div className="flex items-center gap-2">
                                <Label>From Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-32 justify-between font-normal"><>{dateRange?.from ? format(dateRange.from, "dd/MM/yy") : <span>Pick date</span>} <CalendarIcon className="h-4 w-4" /></></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="range" selected={dateRange} onSelect={setDateRange} /></PopoverContent>
                                </Popover>
                                <Label>To Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                         <Button variant="outline" size="sm" className="w-32 justify-between font-normal"><>{dateRange?.to ? format(dateRange.to, "dd/MM/yy") : <span>Pick date</span>} <CalendarIcon className="h-4 w-4" /></></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="range" selected={dateRange} onSelect={setDateRange} /></PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto border-2 border-cyan-500">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={thClassFinalized}>Action</TableHead>
                                    <TableHead className={thClassFinalized}>Lot TYPE</TableHead>
                                    <TableHead className={thClassFinalized}>Vehicle No.</TableHead>
                                    <TableHead className={thClassFinalized}>Dispatch ID</TableHead>
                                    <TableHead className={thClassFinalized}>Dispatch Date</TableHead>
                                    <TableHead className={thClassFinalized}>From Station</TableHead>
                                    <TableHead className={thClassFinalized}>To Station</TableHead>
                                    <TableHead className={thClassFinalized}>Inward ID</TableHead>
                                    <TableHead className={thClassFinalized}>Inward Challan No</TableHead>
                                    <TableHead className={thClassFinalized}>Inward Date</TableHead>
                                    <TableHead className={thClassFinalized}>Total Weight</TableHead>
                                    <TableHead className={thClassFinalized}>Driver</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {finalizedChallans.map(challan => (
                                     <TableRow key={challan.challanId} className="odd:bg-white even:bg-cyan-50/50">
                                        <TableCell className={`${tdClass}`}>
                                             <div className="flex items-center gap-2">
                                                <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push(`/company/challan-tracking?challanId=${challan.challanId}`)}>Modify</Button>
                                                <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push(`/company/challan-tracking?challanId=${challan.challanId}`)}>view</Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`${tdClass}`}>
                                             <span className={cn('font-bold', challan.challanType === 'Dispatch' ? 'text-blue-600' : 'text-purple-600')}>
                                                {challan.challanType.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className={`${tdClass}`}>{challan.vehicleNo}</TableCell>
                                        <TableCell className={`${tdClass}`}>{challan.challanId}</TableCell>
                                        <TableCell className={`${tdClass}`}>{format(parseISO(challan.dispatchDate), 'MM/dd/yy')}</TableCell>
                                        <TableCell className={`${tdClass}`}>{challan.fromStation}</TableCell>
                                        <TableCell className={`${tdClass}`}>{challan.toStation}</TableCell>
                                        <TableCell className={`${tdClass}`}>{challan.inwardId}</TableCell>
                                        <TableCell className={`${tdClass}`}>{/* Inward Challan No */}</TableCell>
                                        <TableCell className={`${tdClass}`}>{challan.inwardDate ? format(parseISO(challan.inwardDate), 'MM/dd/yy') : ''}</TableCell>
                                        <TableCell className={`${tdClass}`}>{challan.totalChargeWeight.toFixed(2)} in kg</TableCell>
                                        <TableCell className={`${tdClass}`}>{challan.driverName}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {finalizedChallans.length === 0 && (
                            <p className="text-center p-4 text-muted-foreground">No challans found for the selected filters.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
