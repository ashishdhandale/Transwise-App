

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
import { PlusCircle, Search, MoreHorizontal, Pencil, Printer, Trash2, Download, Loader2 } from 'lucide-react';
import type { RateList, Customer } from '@/lib/types';
import { getRateLists, saveRateLists } from '@/lib/rate-list-data';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCustomers } from '@/lib/customer-data';
import { format, isAfter, startOfToday } from 'date-fns';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrintableQuotation } from './quotation/printable-quotation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '@/app/company/settings/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandardRateListEditor } from './standard-rate-list-editor';


const thClass = "bg-cyan-500 text-white font-semibold";
const tdClass = "whitespace-nowrap";

export function RateListManagement() {
  const [rateLists, setRateLists] = useState<RateList[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [quotationToPrint, setQuotationToPrint] = useState<RateList | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
        try {
            setRateLists(getRateLists());
            setCustomers(getCustomers());
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
        } catch (error) {
          console.error("Failed to load master data", error);
        }
    }
    loadData();
  }, []);
  
  const findCustomer = (customerId: number) => {
    return customers.find(c => c.id === customerId);
  }

  const handleAddNew = () => {
    router.push('/company/master/quotation/new');
  };

  const handleDelete = (id: number) => {
    const updatedLists = rateLists.filter(list => list.id !== id);
    saveRateLists(updatedLists);
    setRateLists(updatedLists);
    toast({ title: "Quotation Deleted", description: "The quotation has been successfully deleted.", variant: "destructive" });
  };
  
   const handlePrint = (list: RateList) => {
    setQuotationToPrint(list);
    setIsPrintDialogOpen(true);
  };
  
  const handleDownloadPdf = async () => {
    const input = printRef.current;
    if (!input || !quotationToPrint) return;

    setIsDownloading(true);

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps= pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    const ratio = imgWidth / imgHeight;
    const finalImgWidth = pdfWidth - 20;
    const finalImgHeight = finalImgWidth / ratio;
    
    pdf.addImage(imgData, 'PNG', 10, 10, finalImgWidth, finalImgHeight);
    pdf.save(`quotation-${quotationToPrint.name}.pdf`);
    setIsDownloading(false);
  };


  const filteredQuotations = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const quotations = rateLists.filter(list => !list.isStandard);

    if (!searchLower) return quotations;

    return quotations.filter(list => {
      const customer = list.customerIds.length > 0 ? findCustomer(list.customerIds[0]) : null;
      return list.name.toLowerCase().includes(searchLower) ||
             (customer && customer.name.toLowerCase().includes(searchLower));
    });
  }, [rateLists, customers, searchTerm]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="quotations">
          <TabsList className="mb-4">
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="standardRate">Standard Rate List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quotations">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <div>
                    <Label htmlFor="search-quotation" className="text-sm font-semibold">Search By Name / Quote No,</Label>
                    <div className="relative w-full max-w-xs mt-1">
                        <Input
                          id="search-quotation"
                          placeholder="Search..."
                          className="pl-4 pr-10 border-gray-400"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 border-l bg-gray-100 rounded-r-md">
                          <Search className="h-5 w-5 text-gray-500" />
                        </div>
                    </div>
                  </div>
                  <Button onClick={handleAddNew}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Generate New Quotation
                  </Button>
              </div>
              <div className="overflow-x-auto border rounded-md">
                  <Table>
                      <TableHeader>
                      <TableRow>
                          <TableHead className={thClass}>Action</TableHead>
                          <TableHead className={thClass}>Quotation No</TableHead>
                          <TableHead className={thClass}>Customer Name</TableHead>
                          <TableHead className={thClass}>Quotation Date</TableHead>
                          <TableHead className={thClass}>Valid Till</TableHead>
                          <TableHead className={thClass}>Status</TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {filteredQuotations.map((list) => {
                          const customer = list.isStandard ? null : (list.customerIds.length > 0 ? findCustomer(list.customerIds[0]) : null);
                          const isValid = list.validTill ? isAfter(new Date(list.validTill), startOfToday()) : true;
                          const status = isValid ? 'Active' : 'Expired';
                          const statusClass = status === 'Active' ? 'bg-green-600' : 'bg-red-600';
                          
                          return (
                              <TableRow key={list.id}>
                                  <TableCell className={cn(tdClass)}>
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                                  <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem asChild>
                                                  <Link href={`/company/master/quotation/${list.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Update</Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => handlePrint(list)}>
                                                  <Printer className="mr-2 h-4 w-4" />Print
                                              </DropdownMenuItem>
                                              <AlertDialog>
                                                  <AlertDialogTrigger asChild>
                                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                          <Trash2 className="mr-2 h-4 w-4" />Delete
                                                      </DropdownMenuItem>
                                                  </AlertDialogTrigger>
                                                  <AlertDialogContent>
                                                      <AlertDialogHeader>
                                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                          <AlertDialogDescription>
                                                              This action cannot be undone and will permanently delete this quotation.
                                                          </AlertDialogDescription>
                                                      </AlertDialogHeader>
                                                      <AlertDialogFooter>
                                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                          <AlertDialogAction onClick={() => handleDelete(list.id)}>Delete</AlertDialogAction>
                                                      </AlertDialogFooter>
                                                  </AlertDialogContent>
                                              </AlertDialog>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </TableCell>
                                  <TableCell className={cn(tdClass, "font-medium")}>{list.name.replace('Quotation No. ', '')}</TableCell>
                                  <TableCell className={cn(tdClass)}>{customer?.name || 'N/A'}</TableCell>
                                  <TableCell className={cn(tdClass)}>{list.quotationDate ? format(new Date(list.quotationDate), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                                  <TableCell className={cn(tdClass, !isValid ? 'text-red-600 font-semibold' : '')}>{list.validTill ? format(new Date(list.validTill), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                                  <TableCell className={cn(tdClass)}>
                                      <Badge variant="secondary" className={statusClass}>
                                          {status}
                                      </Badge>
                                  </TableCell>
                              </TableRow>
                          );
                      })}
                      </TableBody>
                  </Table>
                  {filteredQuotations.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground">
                          No quotations found.
                      </div>
                  )}
              </div>
          </TabsContent>

          <TabsContent value="standardRate">
              <StandardRateListEditor />
          </TabsContent>
        </Tabs>
      </CardContent>
      {quotationToPrint && (
        <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Print Preview: {quotationToPrint.name}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
                    <div ref={printRef}>
                       <PrintableQuotation 
                            quotationNo={quotationToPrint.name.replace('Quotation No. ', '')}
                            quotationDate={new Date(quotationToPrint.quotationDate || Date.now())}
                            validTill={new Date(quotationToPrint.validTill || Date.now())}
                            party={quotationToPrint.customerIds.length > 0 ? findCustomer(quotationToPrint.customerIds[0]) : undefined}
                            items={quotationToPrint.stationRates}
                            profile={companyProfile}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsPrintDialogOpen(false)}>Close</Button>
                    <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download PDF
                    </Button>
                    <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
