
'use client';

import type { Booking } from '@/lib/bookings-dashboard-data';
import type { CompanyProfileFormValues } from '@/app/company/settings/actions';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

interface DeliveryMemoProps {
    booking: Booking;
    profile: CompanyProfileFormValues;
}

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="flex text-sm">
        <p className="w-28 font-semibold">{label}</p>
        <p className="flex-1">: {value}</p>
    </div>
);

export function DeliveryMemo({ booking, profile }: DeliveryMemoProps) {
    const totalQty = booking.itemRows.reduce((sum, item) => sum + Number(item.qty), 0);
    const totalActWt = booking.itemRows.reduce((sum, item) => sum + Number(item.actWt), 0);
    
    const showFreight = booking.lrType === 'TOPAY' || booking.lrType === 'TBB';
    const amountToCollect = showFreight ? booking.totalAmount.toFixed(2) : '0.00';

    return (
        <div className="p-6 font-sans text-sm text-black bg-white" style={{ width: '210mm' }}>
            <header className="text-center pb-2 space-y-1">
                <h1 className="text-xl font-bold">{profile.companyName}</h1>
                <p className="text-xs">{profile.headOfficeAddress}</p>
                <p className="text-xs">Ph: {profile.companyContactNo} | Email: {profile.companyEmail}</p>
                <p className="text-base font-bold underline mt-4">DELIVERY MEMO</p>
            </header>

            <div className="grid grid-cols-2 gap-x-4 border-y-2 border-black py-2 my-4">
                <div>
                    <DetailRow label="LR No." value={booking.lrNo} />
                    <DetailRow label="LR Date" value={format(new Date(booking.bookingDate), 'dd-MMM-yyyy')} />
                    <DetailRow label="From" value={booking.fromCity} />
                    <DetailRow label="To" value={booking.toCity} />
                </div>
                <div>
                    <DetailRow label="Consignor" value={booking.sender} />
                    <DetailRow label="Consignee" value={booking.receiver} />
                </div>
            </div>

            <div className="mt-4">
                <Table className="border-collapse border border-black">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border border-black">Item Description</TableHead>
                            <TableHead className="border border-black text-center">Packages</TableHead>
                            <TableHead className="border border-black text-right">Actual Wt.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {booking.itemRows.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="border border-black">{item.itemName || item.description}</TableCell>
                                <TableCell className="border border-black text-center">{item.qty}</TableCell>
                                <TableCell className="border border-black text-right">{item.actWt} kg</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold">
                            <TableCell className="border border-black text-right">TOTAL</TableCell>
                            <TableCell className="border border-black text-center">{totalQty}</TableCell>
                            <TableCell className="border border-black text-right">{totalActWt.toFixed(2)} kg</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="mt-4 grid grid-cols-2">
                <div />
                <div className="border border-black p-2 space-y-2">
                     <div className="flex justify-between font-bold text-base border-b pb-1">
                        <span>Booking Type:</span>
                        <span>{booking.lrType}</span>
                    </div>
                     <div className="flex justify-between font-bold text-lg">
                        <span>Amount to Collect:</span>
                        <span className="text-red-600">{amountToCollect}</span>
                    </div>
                </div>
            </div>

            <footer className="mt-16 pt-16">
                <div className="flex justify-between text-sm">
                    <div className="w-1/3 text-center">
                        <p className="pt-1 border-t border-black">Receiver's Signature</p>
                    </div>
                    <div className="w-1/3 text-center">
                         <p className="pt-1 border-t border-black">Date & Time</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
