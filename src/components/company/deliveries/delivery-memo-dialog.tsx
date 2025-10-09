
'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer, Download, Loader2 } from 'lucide-react';
import type { Booking } from '@/lib/bookings-dashboard-data';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DeliveryMemo } from './delivery-memo';

interface DeliveryMemoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  booking: Booking;
  profile: CompanyProfileFormValues;
}

export function DeliveryMemoDialog({ isOpen, onOpenChange, booking, profile }: DeliveryMemoDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    const input = printRef.current;
    if (!input) {
      toast({ title: 'Error', description: 'Could not capture memo for PDF.', variant: 'destructive'});
      return;
    }

    setIsDownloading(true);
    try {
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`delivery-memo-${booking.lrNo}.pdf`);
    } catch (error) {
        toast({ title: 'PDF Error', description: 'Failed to generate PDF.', variant: 'destructive'});
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Delivery Memo Preview: {booking.lrNo}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
            <div ref={printRef} className="bg-white">
                <DeliveryMemo booking={booking} profile={profile} />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
           <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
