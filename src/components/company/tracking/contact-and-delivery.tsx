'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="grid grid-cols-2 text-sm border-b">
    <div className="bg-primary text-primary-foreground font-semibold p-2 border-r">{label}</div>
    <div className="p-2">{value || ''}</div>
  </div>
);

export function ContactAndDelivery() {
  return (
    <div className="space-y-4">
      <Card className="border-gray-300">
        <CardHeader className="p-2 border-b-2 border-primary">
          <CardTitle className="text-base font-bold text-primary">Contact</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <Card className="border-gray-300">
            <CardHeader className="p-2 bg-primary text-primary-foreground rounded-t-md">
              <CardTitle className="text-sm font-bold">Delivery Contact details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <DetailRow label="Office" />
                <DetailRow label="Address" />
                <DetailRow label="Contact Person" />
                <DetailRow label="Contact No" />
            </CardContent>
          </Card>
          <div className="space-y-2">
            <p className="font-semibold text-sm">Share Above Details</p>
            <div className="flex gap-2">
              <Input placeholder="Enter Mobile Number" className="border-gray-300" />
              <Button>Send</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-300">
        <CardHeader className="p-2 bg-primary text-primary-foreground rounded-t-md">
          <CardTitle className="text-sm font-bold">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <DetailRow label="Status" />
            <DetailRow label="Delivery Type" />
            <DetailRow label="D.M. NO" />
            <DetailRow label="Delivery Date & Time" />
            <DetailRow label="Received BY" />
            <DetailRow label="Deliverd By" />
        </CardContent>
      </Card>
    </div>
  );
}
