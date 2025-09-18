
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { FileText, MoreHorizontal, Search } from 'lucide-react';
import { getChallanData, type Challan } from '@/lib/challan-data';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const thClass = "bg-primary/10 text-primary font-semibold";

export function ChallanList() {
    const [challans, setChallans] = useState<Challan[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function loadData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            setChallans(getChallanData());
        }
        loadData();
    }, []);

    const filteredChallans = useMemo(() => {
        if (!searchQuery) {
            return challans;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return challans.filter((challan) =>
            challan.challanId.toLowerCase().includes(lowercasedQuery) ||
            challan.vehicleNo.toLowerCase().includes(lowercasedQuery) ||
            challan.fromStation.toLowerCase().includes(lowercasedQuery) ||
            challan.toStation.toLowerCase().includes(lowercasedQuery)
        );
    }, [challans, searchQuery]);

    const formatCurrency = (amount: number) => {
        if (!companyProfile) return amount.toLocaleString();
        return new Intl.NumberFormat(companyProfile.countryCode, { style: 'currency', currency: companyProfile.currency, minimumFractionDigits: 0 }).format(amount);
    }

    const tdClass = "p-2 whitespace-nowrap";

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    Challan List
                </h1>
            </header>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-headline">All Generated Challans</CardTitle>
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
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-md max-h-[75vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={`${thClass} w-[80px]`}>ACTION</TableHead>
                                    <TableHead className={thClass}>Challan ID</TableHead>
                                    <TableHead className={thClass}>Date</TableHead>
                                    <TableHead className={thClass}>Type</TableHead>
                                    <TableHead className={thClass}>From</TableHead>
                                    <TableHead className={thClass}>To</TableHead>
                                    <TableHead className={thClass}>Vehicle No</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Total Pkgs</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Total Weight</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Hire Freight</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredChallans.length > 0 ? (
                                    filteredChallans.map((challan) => (
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
                                                        <DropdownMenuItem>View/Print</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-500">Cancel</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                            <TableCell className={`${tdClass} font-medium`}>{challan.challanId}</TableCell>
                                            <TableCell className={tdClass}>{challan.dispatchDate}</TableCell>
                                            <TableCell className={tdClass}>{challan.challanType}</TableCell>
                                            <TableCell className={tdClass}>{challan.fromStation}</TableCell>
                                            <TableCell className={tdClass}>{challan.toStation}</TableCell>
                                            <TableCell className={tdClass}>{challan.vehicleNo}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{challan.totalPackages}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{challan.totalChargeWeight.toFixed(2)} kg</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{formatCurrency(challan.vehicleHireFreight)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center h-24">
                                            No challans found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
