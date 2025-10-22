

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, MapPin, Building, Calendar, Phone, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/bookings-dashboard-data';
import type { BookingHistory } from '@/lib/history-data';
import { format, parseISO } from 'date-fns';
import type { CompanyProfileFormValues } from '@/app/company/settings/actions';
import { Separator } from '@/components/ui/separator';

const DetailRow = ({ label, value, children, className }: { label?: string; value?: string | number; children?: React.ReactNode, className?: string }) => (
  <div className={cn("grid grid-cols-[100px_1fr] text-sm items-start", className)}>
    <div className="text-muted-foreground">{label}</div>
    <div className="font-semibold break-words flex items-center uppercase">: {value}{children || ''}</div>
  </div>
);

interface ShippingDetailsProps {
    booking: Booking | null;
    history: BookingHistory | null;
    profile: CompanyProfileFormValues | null;
}

export function ShippingDetails({ booking, history, profile }: ShippingDetailsProps) {
    
    if (!booking) {
        return null;
    }

    const formatValue = (amount: number) => {
        if (!profile) return amount.toLocaleString();
        return amount.toLocaleString(profile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    const deliveredEvent = history?.logs.find(log => log.action === 'Delivered');

  return (
    <Card className="border-primary/30 w-full">
      <CardHeader className="p-4 border-b-2 border-primary/20">
        <CardTitle className="text-lg font-headline text-primary uppercase">Shipping & Delivery Details for: {booking.lrNo}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column: Shipment Details */}
        <div className="space-y-4">
             <Card className="border-gray-200 overflow-hidden shadow-sm h-full">
                <CardHeader className="p-3 bg-muted/50">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><Package className="size-5 text-primary" />Shipment Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    {/* Booking Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        <DetailRow label="Tracking ID" value={booking.trackingId} />
                        <DetailRow label="Booking Date" value={format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')} />
                        <DetailRow label="Item Name" value={booking.itemDescription} className="md:col-span-2"/>
                        <DetailRow label="Total Qty" value={booking.qty} />
                        <DetailRow label="Charge Wt" value={`${booking.chgWt} KG`} />
                        <DetailRow label="Payment Mode" value={booking.lrType} />
                        <DetailRow label="Total Freight" value={formatValue(booking.totalAmount)} />
                    </div>
                    
                    <Separator />
                    
                    {/* Parties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold text-sm mb-2 text-muted-foreground border-b pb-1">SENDER</h4>
                            <DetailRow label="Name" value={booking.sender.name} />
                            <DetailRow label="Origin" value={booking.fromCity} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm mb-2 text-muted-foreground border-b pb-1">RECEIVER</h4>
                            <DetailRow label="Name" value={booking.receiver.name} />
                            <DetailRow label="Destination" value={booking.toCity} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {/* Right Column: Transit & Status */}
        <div className="space-y-4">
             <Card className="border-gray-200 shadow-sm">
                <CardHeader className="p-3 bg-muted/50">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><Truck className="size-5 text-primary" />Transit History</CardTitle>
                </CardHeader>
                <CardContent className="p-4 max-h-60 overflow-y-auto">
                    <div className="relative pl-4">
                        <div className="absolute left-6 top-5 bottom-5 w-0.5 bg-border -z-10"></div>
                        {history?.logs.map((event, index) => (
                             <div key={index} className="relative flex items-start gap-4 mb-6 last:mb-0">
                                <div className={cn("absolute left-[-0.3rem] top-0 flex items-center justify-center size-9 bg-card border-2 rounded-full z-10", 
                                    event.action === 'Delivered' ? 'border-green-500' : 'border-primary'
                                )}>
                                    <Truck className={cn('size-5', event.action === 'Delivered' ? 'text-green-500' : 'text-primary')} />
                                </div>
                                <div className="flex-1 ml-10">
                                    <p className="font-semibold text-sm uppercase">{event.action}</p>
                                    <p className="text-xs text-muted-foreground uppercase">{event.details}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="size-3" />{event.timestamp}</p>
                                </div>
                            </div>
                        ))}
                         {(!history || history.logs.length === 0) && (
                            <p className="text-sm text-muted-foreground">No transit history available.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="p-3 bg-muted/50">
                        <CardTitle className="text-base font-semibold flex items-center gap-2"><MapPin className="size-5 text-primary" />Delivery Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-center">
                        <p className={cn("text-2xl font-bold uppercase", booking.status === 'Delivered' ? 'text-green-600' : 'text-amber-600')}>
                            {booking.status}
                        </p>
                        {deliveredEvent && (
                            <p className="text-sm text-muted-foreground">
                                Delivered on {format(new Date(deliveredEvent.timestamp), 'PPP')}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="p-3 bg-muted/50">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2"><Phone className="size-4 text-primary" />Delivery Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                        <div className="text-sm">
                            <p className="font-semibold uppercase">Transwise - {booking.toCity} Office</p>
                            <p className="text-muted-foreground uppercase">MIDC, Main Road, {booking.toCity}</p>
                            <p className="text-muted-foreground flex items-center gap-1.5"><Phone className="size-3" />+91 98765 43210</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
