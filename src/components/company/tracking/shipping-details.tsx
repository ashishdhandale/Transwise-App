'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Truck, Package, MapPin, Building, Calendar, Phone, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/bookings-dashboard-data';
import type { BookingHistory } from '@/lib/history-data';

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
  <div className="grid grid-cols-[150px_1fr] text-sm border-b last:border-b-0">
    <div className="bg-primary/10 text-primary font-semibold p-2 border-r">{label}</div>
    <div className="p-2 break-words">{value || '-'}</div>
  </div>
);

interface ShippingDetailsProps {
    booking: Booking | null;
    history: BookingHistory | null;
}

export function ShippingDetails({ booking, history }: ShippingDetailsProps) {
    
    if (!booking) {
        return (
             <Card className="border-gray-300 w-full flex items-center justify-center min-h-96">
                <div className="text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto" />
                    <p className="mt-2 font-medium">Search for a GR Number to see details</p>
                    <p className="text-sm">The shipping and delivery details will appear here.</p>
                </div>
            </Card>
        );
    }
    
    const deliveredEvent = history?.logs.find(log => log.action === 'Delivered');

  return (
    <Card className="border-gray-300 w-full">
      <CardHeader className="p-3 border-b-2 border-primary">
        <CardTitle className="text-base font-bold text-primary">Shipping & Delivery Details</CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Booking & Delivery */}
        <div className="xl:col-span-2 space-y-6">
            {/* Booking Details */}
            <Card className="border-gray-300 overflow-hidden">
                <CardHeader className="p-2 bg-primary text-primary-foreground">
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Package className="size-4" />Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <DetailRow label="LR NO" value={booking.lrNo} />
                        <DetailRow label="Booking Date" value={new Date().toISOString().split('T')[0]} />
                        <DetailRow label="Booked From" value={booking.fromCity} />
                        <DetailRow label="Booked To" value={booking.toCity} />
                        <DetailRow label="Item Name" value={booking.itemDescription} />
                        <DetailRow label="Total Qty" value={booking.qty} />
                        <DetailRow label="Total Chg Wt" value={`${booking.chgWt} KG`} />
                        <DetailRow label="Payment Mode" value={booking.lrType} />
                        <DetailRow label="Total Freight" value={`Rs. ${booking.totalAmount.toLocaleString()}`} />
                        <DetailRow label="Booking Note" value="Handle with care" />
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card className="border-gray-300 overflow-hidden">
                <CardHeader className="p-2 bg-primary text-primary-foreground">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><MapPin className="size-4" />Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <DetailRow label="Status" value={booking.status} />
                        <DetailRow label="Delivery Type" value="Door" />
                        <DetailRow label="D.M. NO" value={deliveredEvent ? `DM-${booking.id}`: '-'} />
                        <DetailRow label="Delivery Date" value={deliveredEvent?.timestamp} />
                        <DetailRow label="Received BY" value={deliveredEvent ? 'Signature on File' : '-'} />
                        <DetailRow label="Deliverd By" value={deliveredEvent?.user} />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Transit & Contact */}
        <div className="space-y-6">
            {/* Transit Details */}
            <Card className="border-gray-300">
                <CardHeader className="p-2 bg-primary text-primary-foreground">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><Truck className="size-4" />Transit Details</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                    <div className="relative pl-6">
                        <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border"></div>
                        {history?.logs.map((event, index) => (
                             <div key={index} className="relative flex items-start gap-4 mb-4 last:mb-0">
                                <div className={cn("absolute left-[-1.125rem] top-1.5 size-5 bg-card border-2 rounded-full z-10", 
                                    event.action === 'Delivered' ? 'border-green-500' : 'border-primary'
                                )}></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{event.details}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Truck className="size-3" />{event.action}</p>
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

            {/* Contact Details */}
            <Card className="border-gray-300">
                <CardHeader className="p-2 bg-primary text-primary-foreground">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><Building className="size-4" />Delivery Contact</CardTitle>
                </CardHeader>
                 <CardContent className="p-3 space-y-2">
                    <div className="text-sm">
                        <p className="font-semibold">Transwise - {booking.toCity} Office</p>
                        <p className="text-muted-foreground">MIDC, Main Road, {booking.toCity}</p>
                        <p className="text-muted-foreground flex items-center gap-1.5"><Phone className="size-3" />+91 98765 43210</p>
                    </div>
                    <Separator />
                     <div className="space-y-1">
                        <p className="font-semibold text-xs text-muted-foreground">Share Contact via SMS</p>
                        <div className="flex gap-2">
                        <Input placeholder="Enter Mobile No." className="h-8 text-sm border-gray-300" />
                        <Button size="sm" className="h-8">Send</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
}
