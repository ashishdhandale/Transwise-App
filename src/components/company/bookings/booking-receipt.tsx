
'use client';

import type { Booking } from '@/lib/bookings-dashboard-data';
import { format, parseISO } from 'date-fns';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';

interface BookingReceiptProps {
    booking: Booking;
    companyProfile: CompanyProfileFormValues;
    copyType: 'Receiver' | 'Sender' | 'Driver' | 'Office';
}

const DetailItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex">
        <p className="w-28 font-semibold">{label}</p>
        <p className="flex-1">: {value}</p>
    </div>
);

export function BookingReceipt({ booking, companyProfile, copyType }: BookingReceiptProps) {

    const validItemRows = booking.itemRows.filter(item => (item.description || item.itemName) && item.qty && item.actWt && item.chgWt);
    const subTotal = validItemRows.reduce((s, i) => s + Number(i.lumpsum), 0);
    const otherCharges = booking.totalAmount - subTotal;

    return (
        <div className="p-4 font-mono text-xs text-black">
            <header className="grid grid-cols-3 gap-4 border-b-2 border-black pb-2">
                <div className="col-span-2">
                    <h1 className="text-xl font-bold">{companyProfile.companyName || 'TRANSWISE LOGISTICS'}</h1>
                    <p>{companyProfile.headOfficeAddress || '123 Transport Lane, Logistics City'}</p>
                    <p>Ph: {companyProfile.companyContactNo || '9876543210'} | Email: {companyProfile.companyEmail || 'contact@transwise.com'}</p>
                    <p>GSTIN: {companyProfile.gstNo || '27ABCDE1234F1Z5'}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-sm">GR / CN NOTE</p>
                    <p className="font-bold">{copyType} COPY</p>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-4 mt-2 border-b-2 border-black pb-2">
                <div>
                    <DetailItem label="GR No" value={booking.lrNo} />
                    <DetailItem label="GR Date" value={format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')} />
                </div>
                <div>
                     <DetailItem label="From" value={booking.fromCity} />
                     <DetailItem label="To" value={booking.toCity} />
                </div>
            </section>

             <section className="grid grid-cols-2 gap-4 mt-2 border-b-2 border-black pb-2">
                <div>
                    <p className="font-bold underline">CONSIGNOR:</p>
                    <p className="font-semibold">{booking.sender}</p>
                    {/* Add address from customer master if available */}
                </div>
                <div>
                    <p className="font-bold underline">CONSIGNEE:</p>
                    <p className="font-semibold">{booking.receiver}</p>
                    {/* Add address from customer master if available */}
                </div>
            </section>
            
            <section className="mt-2">
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr className="border border-black">
                            <th className="border border-black p-1">Description of Goods</th>
                            <th className="border border-black p-1">Invoice No</th>
                            <th className="border border-black p-1">Qty</th>
                            <th className="border border-black p-1">Act. Wt.</th>
                            <th className="border border-black p-1">Chg. Wt.</th>
                            <th className="border border-black p-1">Freight</th>
                        </tr>
                    </thead>
                    <tbody>
                         {validItemRows.map(item => (
                            <tr key={item.id}>
                                <td className="border border-black p-1">{item.description || item.itemName}</td>
                                <td className="border border-black p-1">{item.invoiceNo}</td>
                                <td className="border border-black p-1 text-center">{item.qty}</td>
                                <td className="border border-black p-1 text-right">{item.actWt}</td>
                                <td className="border border-black p-1 text-right">{item.chgWt}</td>
                                <td className="border border-black p-1 text-right">{item.lumpsum}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold">
                            <td className="border border-black p-1 text-right" colSpan={2}>TOTAL</td>
                            <td className="border border-black p-1 text-center">{booking.qty}</td>
                            <td className="border border-black p-1 text-right">{validItemRows.reduce((s, i) => s + Number(i.actWt), 0)}</td>
                            <td className="border border-black p-1 text-right">{booking.chgWt}</td>
                            <td className="border border-black p-1 text-right">{subTotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>

             <section className="grid grid-cols-2 gap-4 mt-2">
                <div className="border border-black p-1">
                    <p className="font-bold underline">TERMS & CONDITIONS:</p>
                    <ol className="list-decimal list-inside text-[10px]">
                        <li>All disputes subject to Nagpur jurisdiction only.</li>
                        <li>Goods carried at owner's risk.</li>
                        <li>Company is not responsible for any leakage/breakage.</li>
                    </ol>
                </div>
                 <div className="border border-black p-1">
                    <div className="grid grid-cols-2 gap-x-2">
                        <p className="font-semibold">Sub Total:</p>
                        <p className="text-right">{subTotal.toFixed(2)}</p>
                        
                        <p>Other Charges:</p>
                        <p className="text-right">{otherCharges.toFixed(2)}</p>

                        <p className="font-bold border-t border-black mt-1 pt-1">GRAND TOTAL:</p>
                        <p className="font-bold text-right border-t border-black mt-1 pt-1">
                            {new Intl.NumberFormat(companyProfile.countryCode, { style: 'currency', currency: companyProfile.currency }).format(booking.totalAmount)}
                        </p>
                    </div>
                </div>
            </section>

            <footer className="grid grid-cols-2 gap-4 mt-4 pt-12">
                 <div className="text-center">
                    <p className="border-t border-black pt-1">Receiver's Signature</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold">{companyProfile.companyName || 'TRANSWISE LOGISTICS'}</p>
                    <p className="border-t border-black pt-1">Authorised Signatory</p>
                </div>
            </footer>
        </div>
    );
}

    