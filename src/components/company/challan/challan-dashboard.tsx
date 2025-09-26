
'use client';

import { useState, useEffect } from 'react';
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
import { FileText, PlusCircle, Search, Trash2 } from 'lucide-react';
import { getChallanData, saveChallanData, getLrDetailsData, saveLrDetailsData } from '@/lib/challan-data';
import type { Challan } from '@/lib/challan-data';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
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

const thClass = 'bg-primary/10 text-primary font-semibold whitespace-nowrap';
const tdClass = 'whitespace-nowrap';

const statusColors: { [key: string]: string } = {
  Pending: 'text-yellow-600 border-yellow-500/80',
  Finalized: 'text-green-600 border-green-500/80',
};

const ChallanTable = ({ title, challans, onDelete }: { title: string; challans: Challan[], onDelete?: (challanId: string) => void }) => (
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
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/company/challan/new?challanId=${challan.challanId}`}>View/Edit</Link>
                    </Button>
                    {onDelete && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive ml-2">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
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
  const { toast } = useToast();

  const loadChallanData = () => {
      setAllChallans(getChallanData());
  }

  useEffect(() => {
    loadChallanData();
  }, []);

  const handleDeleteTempChallan = (challanIdToDelete: string) => {
    // Revert bookings to 'In Stock'
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
    
    // Delete the challan and its associated LR details
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


  const pendingChallans = allChallans.filter(c => c.status === 'Pending' && (c.challanId.toLowerCase().includes(searchTerm.toLowerCase()) || (c.vehicleNo && c.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()))));
  const dispatchedChallans = allChallans.filter(c => c.status === 'Finalized' && (c.challanId.toLowerCase().includes(searchTerm.toLowerCase()) || (c.vehicleNo && c.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()))));

  return (
    <main className="flex-1 p-4 md:p-6 bg-secondary/30">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Challan Management
        </h1>
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
            <Button asChild>
                <Link href="/company/challan/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> New Dispatch Challan
                </Link>
            </Button>
        </div>
      </header>
      <div className="space-y-6">
        <ChallanTable title="Pending for Dispatch" challans={pendingChallans} onDelete={handleDeleteTempChallan} />
        <ChallanTable title="Dispatched Challans" challans={dispatchedChallans} />
      </div>
    </main>
  );
}
