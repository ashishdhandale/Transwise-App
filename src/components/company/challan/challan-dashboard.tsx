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
import { FileText, PlusCircle, Search } from 'lucide-react';
import { getChallanData, type Challan } from '@/lib/challan-data';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const thClass = 'bg-primary/10 text-primary font-semibold whitespace-nowrap';
const tdClass = 'whitespace-nowrap';

const statusColors: { [key: string]: string } = {
  Pending: 'text-yellow-600 border-yellow-500/80',
  Finalized: 'text-green-600 border-green-500/80',
};

const ChallanTable = ({ title, challans }: { title: string; challans: Challan[] }) => (
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

  useEffect(() => {
    setAllChallans(getChallanData());
  }, []);

  const pendingChallans = allChallans.filter(c => c.status === 'Pending' && (c.challanId.toLowerCase().includes(searchTerm.toLowerCase()) || c.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())));
  const dispatchedChallans = allChallans.filter(c => c.status === 'Finalized' && (c.challanId.toLowerCase().includes(searchTerm.toLowerCase()) || c.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())));

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
        <ChallanTable title="Pending for Dispatch" challans={pendingChallans} />
        <ChallanTable title="Dispatched Challans" challans={dispatchedChallans} />
      </div>
    </main>
  );
}
