'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="grid grid-cols-2 text-sm border-b">
    <div className="bg-primary text-primary-foreground font-semibold p-2 border-r">{label}</div>
    <div className="p-2">{value || ''}</div>
  </div>
);

const TransitDetailCard = ({ title, details }: { title: string, details: {label: string, value?: string}[] }) => (
    <Card className="border-gray-300">
        <CardHeader className="p-2 bg-primary text-primary-foreground rounded-t-md">
            <CardTitle className="text-sm font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            {details.map(detail => <DetailRow key={detail.label} {...detail} />)}
        </CardContent>
    </Card>
);

const transitDetails1 = [
    { label: "Office Address & Contact" },
    { label: "Arrival Date" },
    { label: "Inward Challan No" },
    { label: "Loading From" },
    { label: "Loading To" },
    { label: "Loading Veh.No" },
    { label: "Loading Date & Time" },
    { label: "Dsipatch Challan No" },
];

const transitDetails2 = [
    { label: "Office Address & Contact" },
    { label: "Loading From" },
    { label: "Loading To" },
    { label: "Loading Veh.No" },
    { label: "Loading Date & Time" },
];

export function ShippingDetails() {
  return (
    <Card className="border-gray-300">
      <CardHeader className="p-2 border-b-2 border-primary">
        <CardTitle className="text-base font-bold text-primary">Shipping Details</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Booking Details */}
          <Card className="border-gray-300">
            <CardHeader className="p-2 bg-primary text-primary-foreground rounded-t-md">
              <CardTitle className="text-sm font-bold">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <DetailRow label="LR NO" />
                <DetailRow label="Booking Date" />
                <DetailRow label="Booked From" />
                <DetailRow label="Booked To" />
                <DetailRow label="Item Name & Description" />
                <DetailRow label="Total Qty" />
                <DetailRow label="Total Chg Wt" />
                <DetailRow label="Payment Mode" />
                <DetailRow label="Total Freight" />
                <DetailRow label="Booking Note" />
            </CardContent>
          </Card>

          {/* Transit Details */}
          <div className="space-y-4">
             <CardHeader className="p-0">
                <CardTitle className="text-base font-bold text-primary">Transit Details</CardTitle>
            </CardHeader>
             <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                    <TransitDetailCard title="Loading Details(Station 2)" details={transitDetails1} />
                    <TransitDetailCard title="Loading Details(Station 1)" details={transitDetails2} />
                </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
