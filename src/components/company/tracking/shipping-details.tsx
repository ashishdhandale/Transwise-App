'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Truck, Package, MapPin, Building, Calendar, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="grid grid-cols-[150px_1fr] text-sm border-b last:border-b-0">
    <div className="bg-primary/10 text-primary-foreground font-semibold p-2 border-r">{label}</div>
    <div className="p-2 break-words">{value || '-'}</div>
  </div>
);

const transitEvents = [
    { 
        station: "Nagpur",
        status: "In Transit",
        vehicle: "MH40-1234",
        date: "2024-07-29 10:00 AM",
        type: "Outward"
    },
    { 
        station: "Nagpur",
        status: "Arrived",
        vehicle: "CG04-5678",
        date: "2024-07-29 08:30 AM",
        type: "Inward"
    },
    { 
        station: "Raipur",
        status: "In Transit",
        vehicle: "CG04-5678",
        date: "2024-07-28 06:00 PM",
        type: "Outward"
    },
];

export function ShippingDetails() {
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
                        <DetailRow label="LR NO" value="123" />
                        <DetailRow label="Booking Date" value="2024-07-28" />
                        <DetailRow label="Booked From" value="Raipur" />
                        <DetailRow label="Booked To" value="Nagpur" />
                        <DetailRow label="Item Name" value="Electronics" />
                        <DetailRow label="Total Qty" value="5" />
                        <DetailRow label="Total Chg Wt" value="50 KG" />
                        <DetailRow label="Payment Mode" value="ToPay" />
                        <DetailRow label="Total Freight" value="Rs. 500" />
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
                        <DetailRow label="Status" value="Delivered" />
                        <DetailRow label="Delivery Type" value="Door" />
                        <DetailRow label="D.M. NO" value="DM-456" />
                        <DetailRow label="Delivery Date" value="2024-07-30 02:45 PM" />
                        <DetailRow label="Received BY" value="Mr. Sharma" />
                        <DetailRow label="Deliverd By" value="Rajesh Kumar" />
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
                        {transitEvents.map((event, index) => (
                             <div key={index} className="relative flex items-start gap-4 mb-4 last:mb-0">
                                <div className="absolute left-[-1.125rem] top-1.5 size-5 bg-card border-2 border-primary rounded-full z-10"></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{event.station} - <span className={cn("font-normal", event.type === 'Inward' ? 'text-green-600' : 'text-blue-600')}>{event.type}</span></p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Truck className="size-3" />{event.vehicle}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="size-3" />{event.date}</p>
                                </div>
                            </div>
                        ))}
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
                        <p className="font-semibold">Transwise - Nagpur Office</p>
                        <p className="text-muted-foreground">MIDC, Hingna Road, Nagpur</p>
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
