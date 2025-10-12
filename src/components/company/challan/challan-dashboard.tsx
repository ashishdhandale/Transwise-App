

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
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
import { FileText, PlusCircle, Search, Trash2, Printer, Loader2, Download, MoreHorizontal, Pencil, Eye, ArrowDownToLine } from 'lucide-react';
import { getChallanData, saveChallanData } from '@/lib/challan-data';
import type { Challan, LrDetail } from '@/lib/challan-data';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { addHistoryLog } from '@/lib/history-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSlip } from './loading-slip';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { getCompanyProfile } from '@/app/company/settings/actions';
import { getDrivers } from '@/lib/driver-data';
import type { Driver } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { getLrDetailsData, saveLrDetailsData } from '@/lib/challan-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClientOnly } from '@/components/ui/client-only';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap";

const statusColors: { [key: string]: string } = {
  Pending: 'text-yellow-600 border-yellow-500/80',
  Finalized: 'text-green-600 border-green-500/80',
};

const ChallanTable = ({ title, challans, onDelete, onReprint, onEdit, showTypeColumn = false }: { title: string; challans: Challan[], onDelete?: (challanId: string) => void, onReprint?: (challan: Challan) => void, onEdit: (challanId: string) => void, showTypeColumn?: boolean }) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-headline">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={thClass}>Challan ID</TableHead>
              {showTypeColumn && <TableHead className={thClass}>Challan Type</TableHead>}
              <TableHead className={thClass}>Date</TableHead>
              <TableHead className={thClass}>From</TableHead>
              <TableHead className={thClass}>To</TableHead>
              <TableHead className={thClass}>Vehicle No</TableHead>
              <TableHead className={thClass}>Total LRs</TableHead>
              <TableHead className={thClass}>Status</TableHead>
              <TableHead className={`${thClass} text-right`}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challans.length > 0 ? (
              challans.map((challan) => (
                <TableRow key={challan.challanId}>
                  <TableCell className={cn(tdClass, 'font-medium')}>
                    {challan.challanId}
                  </TableCell>
                  {showTypeColumn && <TableCell className={tdClass}><Badge variant="outline">{challan.challanType}</Badge></TableCell>}
                  <TableCell className={tdClass}>{challan.dispatchDate}</TableCell>
                  <TableCell className={tdClass}>{challan.fromStation}</TableCell>
                  <TableCell className={tdClass}>{challan.toStation}</TableCell>
                  <TableCell className={tdClass}>{challan.vehicleNo || 'N/A'}</TableCell>
                  <TableCell className={tdClass}>{challan.totalLr}</TableCell>
                  <TableCell className={tdClass}>
                    <Badge variant="outline" className={statusColors[challan.status]}>
                        {challan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={`${tdClass} text-right`}>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => onEdit(challan.challanId)}>
                                <Pencil className="mr-2 h-4 w-4" />View/Edit
                            </DropdownMenuItem>
                            {onReprint && (
                                <DropdownMenuItem onClick={() => onReprint(challan)}>
                                    <Printer className="mr-2 h-4 w-4" /> Reprint
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will delete the temporary challan and move all its LRs back to stock. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(challan.challanId)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showTypeColumn ? 9 : 8} className="h-24 text-center text-muted-foreground">
                  No challans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

export function ChallanDashboard() {
  const [allChallans, setAllChallans] = useState<Challan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [finalizedFilter, setFinalizedFilter] = useState<'All' | 'Dispatch' | 'Inward'>('All');
  const { toast } = useToast();
  
  const printRef = React.useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ challan: Challan, bookings: Booking[] } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const router = useRouter();


  const loadChallanData = async () => {
      const profile = await getCompanyProfile();
      setCompanyProfile(profile);
      setDrivers(getDrivers());
      setAllChallans(getChallanData());
  }

  useEffect(() => {
    loadChallanData();
  }, []);

  const handleDeleteTempChallan = (challanIdToDelete: string) => {
    const lrDetails = getLrDetailsData();
    const lrsToRevert = lrDetails.filter(lr => lr.challanId === challanIdToDelete).map(lr => lr.lrNo);
    
    if (lrsToRevert.length > 0) {
        const allBookings = getBookings();
        const updatedBookings = allBookings.map(booking => {
            if (lrsToRevert.includes(booking.lrNo)) {
                addHistoryLog(booking.lrNo, 'Booking Updated', 'System', `Removed from temp challan ${challanIdToDelete}. Status reverted to 'In Stock'.`);
                return { ...booking, status: 'In Stock' as const };
            }
            return booking;
        });
        saveBookings(updatedBookings);
    }
    
    const updatedChallans = allChallans.filter(c => c.challanId !== challanIdToDelete);
    saveChallanData(updatedChallans);
    setAllChallans(updatedChallans);

    const updatedLrDetails = lrDetails.filter(lr => lr.challanId !== challanIdToDelete);
    saveLrDetailsData(updatedLrDetails);

    toast({
        title: "Temporary Challan Deleted",
        description: `${challanIdToDelete} has been deleted and its LRs have been returned to stock.`,
    });
  };

  const handleReprintChallan = (challan: Challan) => {
    const lrDetails = getLrDetailsData().filter(lr => lr.challanId === challan.challanId);
    const lrNos = new Set(lrDetails.map(lr => lr.lrNo));
    const bookings = getBookings().filter(b => lrNos.has(b.lrNo));
    setPreviewData({ challan, bookings });
    setIsPreviewOpen(true);
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

  const handleEditChallan = (challanId: string) => {
    const challan = allChallans.find(c => c.challanId === challanId);
    if (challan?.challanType === 'Inward') {
      router.push(`/company/challan/new-inward?challanId=${challanId}`);
    } else {
      router.push(`/company/challan/new?challanId=${challanId}`);
    }
  }

  const sortedChallans = useMemo(() => {
    return [...allChallans].sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
  }, [allChallans]);

  const pendingDispatchChallans = sortedChallans.filter(c => c.status === 'Pending' && c.challanType === 'Dispatch' && (c.challanId.toLowerCase().includes(searchTerm.toLowerCase()) || (c.vehicleNo && c.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()))));
  
  const finalizedAndInwardChallans = useMemo(() => {
    const combined = sortedChallans.filter(c => 
        (c.status === 'Finalized' || c.challanType === 'Inward') &&
        (c.challanId.toLowerCase().includes(searchTerm.toLowerCase()) || (c.vehicleNo && c.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    if (finalizedFilter === 'All') {
        return combined;
    }
    return combined.filter(c => c.challanType === finalizedFilter);
  }, [sortedChallans, searchTerm, finalizedFilter]);


  return (
    <>
      <main className="flex-1 p-4 md:p-6 bg-secondary/30">
        <header className="mb-4">
          <ClientOnly><div/></ClientOnly>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Challan Management
            </h1>
            <div className="flex items-center gap-4">
                <Button asChild>
                    <Link href="/company/challan/new-inward">
                        <ArrowDownToLine className="mr-2 h-4 w-4" /> New Inward Challan
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/company/challan/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Dispatch Challan
                    </Link>
                </Button>
            </div>
          </div>
        </header>
        <div className="space-y-6">
          <ChallanTable title="Pending for Dispatch" challans={pendingDispatchChallans} onDelete={handleDeleteTempChallan} onEdit={handleEditChallan} />
          
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline">Finalized Challan</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="relative w-full max-w-sm">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by Challan or Vehicle No..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <RadioGroup defaultValue="All" onValueChange={(value) => setFinalizedFilter(value as any)} className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="All" id="all" />
                                <Label htmlFor="all" className="font-normal">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Dispatch" id="dispatch" />
                                <Label htmlFor="dispatch" className="font-normal">Dispatch</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Inward" id="inward" />
                                <Label htmlFor="inward" className="font-normal">Inward</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChallanTable title="" challans={finalizedAndInwardChallans} onReprint={handleReprintChallan} onEdit={handleEditChallan} showTypeColumn={true} />
            </CardContent>
          </Card>
        </div>
      </main>

      {previewData && companyProfile && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        Print Preview: {previewData.challan.challanId}
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
                    <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                    <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download PDF
                    </Button>
                    <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
