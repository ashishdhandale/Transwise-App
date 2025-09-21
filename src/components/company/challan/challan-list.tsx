
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
import { FileText, MoreHorizontal, Search, PlusCircle, Pencil, Trash2, CheckCircle, Eye } from 'lucide-react';
import { getChallanData, type Challan, saveChallanData } from '@/lib/challan-data';
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

const thClass = "bg-primary/10 text-primary font-semibold";

export function ChallanList() {
    const [challans, setChallans] = useState<Challan[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
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
        const pending = all.filter(c => c.status === 'Pending')
            .sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
        const finalized = all.filter(c => c.status === 'Finalized')
            .sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
        return { pendingChallans: pending, finalizedChallans: finalized };
    }, [challans]);

    const handleFinalize = (challanId: string) => {
        const updatedChallans = getChallanData().map(c => {
            if (c.challanId === challanId) {
                return { ...c, status: 'Finalized' as const, challanId: c.challanId.replace('TEMP-', '') };
            }
            return c;
        });
        saveChallanData(updatedChallans);
        setChallans(updatedChallans);
        toast({ title: "Challan Finalized", description: `Challan ${challanId} has been finalized.` });
    };
    
    const handleDelete = (challanId: string) => {
        const updatedChallans = getChallanData().filter(c => c.challanId !== challanId);
        saveChallanData(updatedChallans);
        setChallans(updatedChallans);
        toast({ title: "Challan Deleted", variant: "destructive" });
    }

    const formatValue = (amount: number) => {
        if (!companyProfile) return amount.toLocaleString();
        return amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    const tdClass = "p-2 whitespace-nowrap";

    const ChallanTable = ({ title, data, isPending = false }: { title: string, data: Challan[], isPending?: boolean }) => (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{title}</CardTitle>
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
                     <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search challans..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button asChild>
                        <Link href="/company/challan/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> New PTL Challan
                        </Link>
                    </Button>
                </div>
            </header>
            
            <div className="space-y-6">
                <ChallanTable title="Pending Challans" data={pendingChallans} isPending />
                <ChallanTable title="Finalized Challans" data={finalizedChallans} />
            </div>
        </div>
    )
}
