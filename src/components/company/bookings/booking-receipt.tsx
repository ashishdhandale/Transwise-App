

'use client';

import type { Booking, CustomerData } from '@/lib/bookings-dashboard-data';
import { format, parseISO } from 'date-fns';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import Image from 'next/image';

interface BookingReceiptProps {
    booking: Booking;
    companyProfile: AllCompanySettings;
    copyType: 'Receiver' | 'Sender' | 'Driver' | 'Office';
}

const DetailItem = ({ label, value, isBold = false }: { label: string; value: string | number | undefined, isBold?: boolean }) => (
    <div className="flex">
        <p className="w-28 font-semibold">{label}</p>
        <p className={`flex-1 ${isBold ? 'font-bold' : ''}`}>: {value}</p>
    </div>
);

const PartyDetails = ({ title, party }: { title: string; party: CustomerData }) => (
    <div>
        <p className="font-bold underline">{title}:</p>
        <p className="font-semibold">{party.name}</p>
        <p>{party.address}</p>
        <p>GSTIN: {party.gstin}</p>
        <p>Mob: {party.mobile}</p>
    </div>
);

export function BookingReceipt({ booking, companyProfile, copyType }: BookingReceiptProps) {

    const validItemRows = booking.itemRows.filter(item => (item.description || item.itemName) && item.qty && item.actWt && item.chgWt);
    const subTotal = validItemRows.reduce((s, i) => s + Number(i.lumpsum), 0);
    const otherChargesTotal = Object.values(booking.additionalCharges || {}).reduce((sum, charge) => sum + charge, 0);
    const gstAmount = booking.totalAmount - (subTotal + otherChargesTotal);

    const isFtl = booking.loadType === 'FTL';
    
    // Conditional logic for showing financial details
    let shouldShowFinancials = false;
    if (copyType === 'Office') {
        shouldShowFinancials = true;
    } else if (booking.lrType === 'PAID') {
        if (copyType === 'Sender') {
            shouldShowFinancials = true;
        }
    } else if (booking.lrType === 'TOPAY') {
        if (copyType === 'Sender' || copyType === 'Receiver') {
            shouldShowFinancials = true;
        }
    }
    // For TBB and FOC, shouldShowFinancials remains false for non-office copies.
    if (booking.status === 'Cancelled') {
        shouldShowFinancials = false;
    }


    const formatValue = (value: number) => {
        return value.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };


    return (
        <div className="relative p-4 font-mono text-xs text-black bg-white">
            {booking.status === 'Cancelled' && (
                 <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div 
                        className="text-9xl font-extrabold text-red-500 opacity-30 transform -rotate-15 select-none"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
                    >
                        CANCELLED
                    </div>
                </div>
            )}
            <div className={booking.status === 'Cancelled' ? 'opacity-60' : ''}>
                <header className="grid grid-cols-3 gap-4 border-b-2 border-black pb-2">
                    <div className="col-span-2">
                        <h1 className="text-xl font-bold">{companyProfile.companyName || 'TRANSWISE LOGISTICS'}</h1>
                        <p>{companyProfile.headOfficeAddress || '123 Transport Lane, Logistics City'}</p>
                        <p>Ph: {companyProfile.companyContactNo || '9876543210'} | Email: {companyProfile.companyEmail || 'contact@transwise.com'}</p>
                        <p>GSTIN: {companyProfile.gstNo || '27ABCDE1234F1Z5'}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-sm">Lorry Receipt</p>
                        <p className="font-bold">{copyType} COPY</p>
                        <Image
                            src={`https://barcode.tec-it.com/barcode.ashx?data=${booking.trackingId}&code=Code128&dpi=96`}
                            alt={`Barcode for ${booking.trackingId}`}
                            width={150}
                            height={20}
                            className="ml-auto mt-1"
                        />
                         <p className="text-center font-mono text-[10px] tracking-widest">{booking.trackingId}</p>
                    </div>
                </header>

                <section className="grid grid-cols-3 gap-4 mt-2 border-b-2 border-black pb-2">
                    <div className="col-span-2">
                        <DetailItem label="LR No" value={booking.referenceLrNumber ? `${booking.lrNo} / ${booking.referenceLrNumber}`: booking.lrNo} isBold />
                        <DetailItem label="LR Date" value={format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')} isBold />
                        <DetailItem label="From" value={booking.fromCity} />
                        <DetailItem label="To" value={booking.toCity} />
                    </div>
                    <div className="flex flex-col items-center justify-center border-2 border-black rounded-md p-1">
                        <h2 className="text-lg font-extrabold text-center">{booking.lrType}</h2>
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-4 mt-2 border-b-2 border-black pb-2">
                    <PartyDetails title="CONSIGNOR" party={booking.sender} />
                    <PartyDetails title="CONSIGNEE" party={booking.receiver} />
                </section>
                
                {isFtl && booking.ftlDetails && shouldShowFinancials && (
                    <section className="mt-2 border-b-2 border-black pb-2 text-[11px]">
                        <h3 className="font-bold underline text-center mb-1">VEHICLE & FREIGHT DETAILS</h3>
                        <div className="grid grid-cols-3 gap-x-4">
                            <p><span className="font-semibold">Vehicle No:</span> {booking.ftlDetails.vehicleNo}</p>
                            <p><span className="font-semibold">Driver:</span> {booking.ftlDetails.driverName}</p>
                            <p><span className="font-semibold">Supplier:</span> {booking.ftlDetails.lorrySupplier}</p>
                            <p><span className="font-semibold">Truck Freight:</span> {formatValue(booking.ftlDetails.truckFreight)}</p>
                            <p><span className="font-semibold">Advance:</span> {formatValue(booking.ftlDetails.advance)}</p>
                            <p><span className="font-semibold">Balance:</span> {formatValue(booking.ftlDetails.truckFreight - booking.ftlDetails.advance)}</p>
                        </div>
                    </section>
                )}
                
                <section className="mt-2">
                    <table className="w-full border-collapse border border-black">
                        <thead>
                            <tr className="border border-black">
                                <th className="border border-black p-1">Description of Goods</th>
                                <th className="border border-black p-1">Invoice No</th>
                                <th className="border border-black p-1">Qty</th>
                                <th className="border border-black p-1">Act. Wt.</th>
                                <th className="border border-black p-1">Chg. Wt.</th>
                                {shouldShowFinancials && <th className="border border-black p-1">Freight</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {validItemRows.map(item => (
                                <tr key={item.id}>
                                    <td className="border border-black p-1">{`${item.itemName || ''} - ${item.description || ''}`}</td>
                                    <td className="border border-black p-1">{item.invoiceNo}</td>
                                    <td className="border border-black p-1 text-center">{item.qty}</td>
                                    <td className="border border-black p-1 text-right">{item.actWt}</td>
                                    <td className="border border-black p-1 text-right">{item.chgWt}</td>
                                    {shouldShowFinancials && <td className="border border-black p-1 text-right">{Number(item.lumpsum).toFixed(2)}</td>}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td className="border border-black p-1 text-right" colSpan={2}>TOTAL</td>
                                <td className="border border-black p-1 text-center">{booking.qty}</td>
                                <td className="border border-black p-1 text-right">{validItemRows.reduce((s, i) => s + Number(i.actWt), 0).toFixed(2)}</td>
                                <td className="border border-black p-1 text-right">{booking.chgWt.toFixed(2)}</td>
                                {shouldShowFinancials && <td className="border border-black p-1 text-right">{subTotal.toFixed(2)}</td>}
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
                        {shouldShowFinancials ? (
                            <div className="grid grid-cols-2 gap-x-2 text-[11px]">
                                <p className="font-semibold">Sub Total:</p>
                                <p className="text-right">{formatValue(subTotal)}</p>
                                
                                {Object.entries(booking.additionalCharges || {}).map(([key, value]) => (
                                    value > 0 && <React.Fragment key={key}>
                                        <p>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</p>
                                        <p className="text-right">{formatValue(value)}</p>
                                    </React.Fragment>
                                ))}
                                
                                {gstAmount > 0 && (
                                    <>
                                        <p>GST:</p>
                                        <p className="text-right">{formatValue(gstAmount)}</p>
                                    </>
                                )}


                                <p className="font-bold border-t border-black mt-1 pt-1">GRAND TOTAL:</p>
                                <p className="font-bold text-right border-t border-black mt-1 pt-1 text-sm">
                                    {formatValue(booking.totalAmount)}
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                {/* This space is intentionally left blank for TBB/FOC on non-office copies */}
                            </div>
                        )}
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
        </div>
    );
}
