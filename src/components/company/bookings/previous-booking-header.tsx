
'use client';

import { Card } from "@/components/ui/card";

interface PreviousBookingHeaderProps {
    lrNo: string;
    type: string;
    sender: string;
    receiver: string;
    qty: number;
    toCity: string;
}

export function PreviousBookingHeader({ lrNo, type, sender, receiver, qty, toCity }: PreviousBookingHeaderProps) {
    return (
        <Card className="bg-primary text-primary-foreground p-2 rounded-md shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-bold">Previous Booking:</span>
                    <span className="font-semibold">LR No.</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded">{lrNo}</span>
                    <span className="font-semibold">Type</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded">{type}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Sender :</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded">{sender}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="font-semibold">Receiver :</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded">{receiver}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">QTY</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded">{qty}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">To City</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded">{toCity}</span>
                </div>
            </div>
        </Card>
    );
}
