
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
import { Input } from '@/components/ui/input';
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

const thClass = "bg-primary/10 text-primary font-semibold";

export function ChallanList() {
    const [challans, setChallans] = useState<Challan[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [finalizedSearchQuery, setFinalizedSearchQuery] = useState('');
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
        const all = getChallanData();
        const pending = all.filter(c => c.status === 'Pending' && (
                c.challanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.toStation.toLowerCase().includes(searchQuery.toLowerCase())
            ))
            .sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
            
        let finalized = all.filter(c => c.status === 'Finalized');

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
        
        if (finalizedSearchQuery) {
            const lowerQuery = finalizedSearchQuery.toLowerCase();
            finalized = finalized.filter(c => 
                c.challanId.toLowerCase().includes(lowerQuery) ||
                c.vehicleNo.toLowerCase().includes(lowerQuery) ||
                c.toStation.toLowerCase().includes(lowerQuery)
            );
        }

        finalized.sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());

        return { pendingChallans: pending, finalizedChallans: finalized };
    }, [challans, searchQuery, finalizedSearchQuery, dateRange]);

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
        setChallans(updatedChallans);
    };
    
    const handleDelete = (challanId: string) => {
        // Revert associated bookings to 'In Stock'
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

        // Remove LR details associated with the challan
        const remainingLrDetails = allLrDetails.filter(lr => lr.challanId !== challanId);
        saveLrDetailsData(remainingLrDetails);
        
        // Remove the challan itself
        const updatedChallans = getChallanData().filter(c => c.challanId !== challanId);
        saveChallanData(updatedChallans);
        
        setChallans(updatedChallans);
        toast({ title: "Challan Deleted", description: `Associated LRs have been returned to stock.`, variant: "destructive" });
    }

    const formatValue = (amount: number) => {
        if (!companyProfile) return amount.toLocaleString();
        return amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    const tdClass = "p-2 whitespace-nowrap";

    const ChallanTable = ({ title, data, isPending = false, onSearchChange, searchValue }: { title: string, data: Challan[], isPending?: boolean, onSearchChange?: (val: string) => void, searchValue?: string }) => (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="font-headline">{title}</CardTitle>
                 {onSearchChange && (
                     <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by ID, Vehicle, Station..."
                            className="pl-8"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                 )}
                 {!isPending && (
                    <div className="flex items-center gap-2">
                        <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-[260px] justify-start text-left font-normal",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                  {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                 )}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-md max-h-[75vh]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className={`${thClass} w-[80px]`}>ACTION</TableHead>
                                <TableHead className={thClass}>Challan ID</TableHead>
                                <TableHead className={thClass}>Status</TableHead>
                                <TableHead className={thClass}>Date</TableHead>
                                <TableHead className={thClass}>From</TableHead>
                                <TableHead className={thClass}>To</TableHead>
                                <TableHead className={thClass}>Vehicle No</TableHead>
                                <TableHead className={`${thClass} text-right`}>Total Pkgs</TableHead>
                                <TableHead className={`${thClass} text-right`}>Total Weight</TableHead>
                                <TableHead className={`${thClass} text-right`}>Hire Freight</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((challan) => (
                                    <TableRow key={challan.challanId}>
                                        <TableCell className="p-1 text-center whitespace-nowrap">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => router.push(`/company/challan-tracking?challanId=${challan.challanId}`)}>
                                                        <Eye className="mr-2 h-4 w-4" />View/Print
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                    {isPending && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-green-600" onClick={() => handleFinalize(challan.challanId)}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />Finalize
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(challan.challanId)}>
                                                                <Trash2 className="mr-2 h-4 w-4" />Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell className={`${tdClass} font-medium`}>
                                            <Link href={`/company/challan-tracking?challanId=${challan.challanId}`} className="text-primary hover:underline">
                                                {challan.challanId}
                                            </Link>
                                        </TableCell>
                                        <TableCell className={tdClass}>
                                            <Badge variant={challan.status === 'Pending' ? 'destructive' : 'default'}>{challan.status}</Badge>
                                        </TableCell>
                                        <TableCell className={tdClass}>{challan.dispatchDate}</TableCell>
                                        <TableCell className={tdClass}>{challan.fromStation}</TableCell>
                                        <TableCell className={tdClass}>{challan.toStation}</TableCell>
                                        <TableCell className={tdClass}>{challan.vehicleNo}</TableCell>
                                        <TableCell className={`${tdClass} text-right`}>{challan.totalPackages}</TableCell>
                                        <TableCell className={`${tdClass} text-right`}>{challan.totalChargeWeight.toFixed(2)} kg</TableCell>
                                        <TableCell className={`${tdClass} text-right`}>{formatValue(challan.vehicleHireFreight)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center h-24">
                                        No {isPending ? 'pending' : 'finalized'} challans found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    Challan List
                </h1>
                <div className="flex items-center gap-4">
                    <Button asChild>
                        <Link href="/company/challan/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> New PTL Challan
                        </Link>
                    </Button>
                </div>
            </header>
            
            <div className="space-y-6">
                <ChallanTable 
                    title="Pending Challans" 
                    data={pendingChallans} 
                    isPending 
                    onSearchChange={setSearchQuery} 
                    searchValue={searchQuery}
                />
                <ChallanTable 
                    title="Finalized Challans" 
                    data={finalizedChallans} 
                    onSearchChange={setFinalizedSearchQuery}
                    searchValue={finalizedSearchQuery}
                />
            </div>
        </div>
    )
}

    