
'use client';

import type { Booking } from '@/lib/bookings-dashboard-data';
import type { Challan } from '@/lib/challan-data';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { format, parseISO } from 'date-fns';

interface FtlChallanProps {
    challan: Challan;
    booking: Booking;
    profile: CompanyProfileFormValues;
}

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="flex text-sm">
        <p className="w-32 font-semibold">{label}</p>
        <p className="flex-1 font-bold">: {value}</p>
    </div>
);


export function FtlChallan({ challan, booking, profile }: FtlChallanProps) {
    const totalQty = booking.itemRows.reduce((sum, item) => sum + Number(item.qty), 0);
    const totalActWt = booking.itemRows.reduce((sum, item) => sum + Number(item.actWt), 0);
    const totalChgWt = booking.itemRows.reduce((sum, item) => sum + Number(item.chgWt), 0);

    return (
        <div className="p-4 font-mono text-xs text-black bg-white">
            <header className="text-center border-b-2 border-black pb-2">
                <h1 className="text-xl font-bold">{profile.companyName}</h1>
                <p>{profile.headOfficeAddress}</p>
                <p>Ph: {profile.companyContactNo} | Email: {profile.companyEmail}</p>
            </header>
            <div className="text-center font-bold text-lg my-2">
                CHALLAN
            </div>

            <section className="grid grid-cols-2 gap-x-4 border-y-2 border-black py-2">
                <div>
                    <DetailRow label="Challan No" value={challan.challanId} />
                    <DetailRow label="Challan Date" value={challan.dispatchDate} />
                    <DetailRow label="From" value={challan.fromStation} />
                    <DetailRow label="To" value={challan.toStation} />
                </div>
                 <div>
                    <DetailRow label="Vehicle No" value={challan.vehicleNo} />
                    <DetailRow label="Driver Name" value={challan.driverName} />
                    <DetailRow label="Lorry Supplier" value={booking.ftlDetails?.lorrySupplier} />
                </div>
            </section>
            
            <section className="mt-2">
                 <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="border border-black bg-gray-100">
                            <th className="border border-black p-1">GR No</th>
                            <th className="border border-black p-1">Date</th>
                            <th className="border border-black p-1">Consignor</th>
                            <th className="border border-black p-1">Consignee</th>
                            <th className="border border-black p-1">Pkgs</th>
                            <th className="border border-black p-1">Description</th>
                            <th className="border border-black p-1">Ch. WT</th>
                        </tr>
                    </thead>
                     <tbody>
                        <tr>
                            <td className="border border-black p-1">{booking.lrNo}</td>
                            <td className="border border-black p-1">{format(parseISO(booking.bookingDate), 'dd-MMM-yy')}</td>
                            <td className="border border-black p-1">{booking.sender}</td>
                            <td className="border border-black p-1">{booking.receiver}</td>
                            <td className="border border-black p-1 text-center">{totalQty}</td>
                            <td className="border border-black p-1">{booking.itemDescription}</td>
                            <td className="border border-black p-1 text-right">{totalChgWt.toFixed(2)}</td>
                        </tr>
                     </tbody>
                     <tfoot>
                        <tr className="font-bold bg-gray-100">
                            <td className="border border-black p-1 text-right" colSpan={4}>TOTAL</td>
                            <td className="border border-black p-1 text-center">{totalQty}</td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1 text-right">{totalChgWt.toFixed(2)}</td>
                        </tr>
                     </tfoot>
                </table>
            </section>
            
            <section className="grid grid-cols-2 gap-4 mt-2">
                 <div className="border border-black p-2 space-y-1">
                    <h3 className="font-bold underline">Freight Details</h3>
                    <DetailRow label="Truck Freight" value={challan.vehicleHireFreight.toFixed(2)} />
                    <DetailRow label="Advance" value={challan.advance.toFixed(2)} />
                    <DetailRow label="Commission" value={booking.ftlDetails?.commission.toFixed(2)} />
                    <DetailRow label="Other Deductions" value={booking.ftlDetails?.otherDeductions.toFixed(2)} />
                    <DetailRow label="Balance Freight" value={challan.balance.toFixed(2)} />
                 </div>
                 <div className="border border-black p-2">
                    <h3 className="font-bold underline">Dispatch Note</h3>
                    <p className="text-xs min-h-[50px]">{/* Dispatch note content can go here */}</p>
                 </div>
            </section>

             <footer className="grid grid-cols-3 gap-4 mt-8 pt-8 text-center text-sm">
                 <div>
                    <p className="border-t border-black pt-1">Driver's Signature</p>
                </div>
                <div>
                    <p className="border-t border-black pt-1">Prepared By</p>
                </div>
                <div>
                    <p className="border-t border-black pt-1">For {profile.companyName}</p>
                </div>
            </footer>
        </div>
    );
}

