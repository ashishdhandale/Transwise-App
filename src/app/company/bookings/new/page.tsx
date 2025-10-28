
'use client';

import { Suspense, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/(dashboard)/layout';
import { BookingForm } from '@/components/company/bookings/booking-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookingReceipt } from '@/components/company/bookings/booking-receipt';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Plus, Printer, X } from 'lucide-react';
import { loadCompanySettingsFromStorage, type AllCompanySettings } from '@/app/company/settings/actions';
import type { Booking } from '@/lib/bookings-dashboard-data';
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function NewBookingPage() {
    const router = useRouter();
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<Booking | null>(null);
    const [companyProfile, setCompanyProfile] = useState<AllCompanySettings | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const printRef = React.useRef<HTMLDivElement>(null);
    
    const [formKey, setFormKey] = useState(Date.now());

    const handleSaveSuccess = useCallback((booking: Booking) => {
        setCompanyProfile(loadCompanySettingsFromStorage());
        setReceiptData(booking);
        setShowReceipt(true);
    }, []);

    const handleNewBooking = () => {
        setShowReceipt(false);
        setReceiptData(null);
        setFormKey(Date.now());
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            router.push('/company/bookings');
        }
        setShowReceipt(open);
    };
    
     const handleDownloadPdf = async () => {
        const input = printRef.current;
        if (!input || !receiptData) return;

        setIsDownloading(true);
        
        await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: true,
            scrollY: -window.scrollY,
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'legal',
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;

            const ratio = imgWidth / imgHeight;
            let finalImgWidth = pdfWidth;
            let finalImgHeight = pdfWidth / ratio;
            
            if (finalImgHeight > pdfHeight) {
                finalImgHeight = pdfHeight;
                finalImgWidth = finalImgHeight * ratio;
            }
            
            const x = (pdfWidth - finalImgWidth) / 2;
            let y = 0;

            pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
            pdf.save(`docs-${receiptData?.lrNo || 'download'}.pdf`);
        });

        setIsDownloading(false);
    };


    return (
        <DashboardLayout>
            <main className="flex-1 p-4 md:p-6">
                <BookingForm key={formKey} onSaveSuccess={handleSaveSuccess} />

                 {receiptData && companyProfile && (
                    <Dialog open={showReceipt} onOpenChange={handleDialogClose}>
                        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Documents Preview</DialogTitle>
                            </DialogHeader>
                            <div className="flex-grow overflow-auto p-4 bg-gray-200">
                                <div ref={printRef} className="bg-white shadow-lg mx-auto" style={{width: '210mm'}}>
                                    <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Receiver" />
                                    <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                    <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Sender" />
                                    <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                    <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Driver" />
                                    <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                    <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Office" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={handleNewBooking}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Booking
                                </Button>
                                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                    Download PDF
                                </Button>
                                <Button onClick={() => router.push('/company/bookings')}>
                                    <X className="mr-2 h-4 w-4" /> Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </main>
        </DashboardLayout>
    );
}

export default function NewBookingRootPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewBookingPage />
        </Suspense>
    )
}

    