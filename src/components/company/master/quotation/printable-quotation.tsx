
'use client';

import type { Customer, StationRate } from '@/lib/types';
import type { CompanyProfileFormValues } from '@/app/company/settings/actions';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

interface PrintableQuotationProps {
    quotationNo: string;
    quotationDate: Date;
    party?: Customer;
    items: StationRate[];
    profile: CompanyProfileFormValues | null;
}

const thClass = "text-left text-xs font-bold text-black border border-black";
const tdClass = "text-xs border border-black p-1";

export function PrintableQuotation({ quotationNo, quotationDate, party, items, profile }: PrintableQuotationProps) {
    const totalRate = items.reduce((sum, item) => sum + item.rate, 0);

    return (
        <div className="p-6 font-sans text-black bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
            <header className="text-center pb-2 space-y-1">
                <h1 className="text-2xl font-bold">{profile?.companyName || 'Your Company'}</h1>
                <p className="text-sm">{profile?.headOfficeAddress}</p>
                <p className="text-sm">Ph: {profile?.companyContactNo} | Email: {profile?.companyEmail}</p>
                <p className="text-lg font-bold underline mt-4">QUOTATION</p>
            </header>

            <div className="grid grid-cols-2 gap-x-4 text-sm border-y border-black py-2 my-4">
                <div>
                    <p><span className="font-semibold">Quotation No:</span> {quotationNo}</p>
                    <p><span className="font-semibold">Date:</span> {format(quotationDate, 'dd-MMM-yyyy')}</p>
                </div>
                <div>
                    <p className="font-semibold">To,</p>
                    <p className="font-bold">{party?.name || 'Valued Customer'}</p>
                    <p>{party?.address}</p>
                    <p>GSTIN: {party?.gstin}</p>
                </div>
            </div>

            <p className="text-sm mb-2">Dear Sir/Madam,</p>
            <p className="text-sm mb-4">With reference to your inquiry, we are pleased to quote our best rates as under:</p>

            <div className="mt-2">
                <Table className="border-collapse border border-black">
                    <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>#</TableHead>
                            <TableHead className={thClass}>From</TableHead>
                            <TableHead className={thClass}>To</TableHead>
                            <TableHead className={thClass}>Item</TableHead>
                            <TableHead className={thClass}>Wt./Unit</TableHead>
                            <TableHead className={thClass}>Rate</TableHead>
                            <TableHead className={thClass}>Per</TableHead>
                            <TableHead className={thClass}>Booking Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className={tdClass}>{index + 1}</TableCell>
                                <TableCell className={tdClass}>{item.fromStation}</TableCell>
                                <TableCell className={tdClass}>{item.toStation}</TableCell>
                                <TableCell className={tdClass}>{item.itemName || 'Any'}</TableCell>
                                <TableCell className={tdClass}>{item.wtPerUnit || 'N/A'}</TableCell>
                                <TableCell className={tdClass}>{item.rate}</TableCell>
                                <TableCell className={tdClass}>{item.rateOn}</TableCell>
                                <TableCell className={tdClass}>{item.lrType}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <div className="mt-6 text-sm space-y-2">
                <h3 className="font-bold underline">Terms & Conditions:</h3>
                <ol className="list-decimal list-inside text-xs space-y-1">
                    <li>GST will be charged extra as applicable.</li>
                    <li>Rates are valid for a period of 30 days.</li>
                    <li>All disputes subject to Nagpur jurisdiction only.</li>
                    <li>Goods will be carried at owner's risk.</li>
                </ol>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-16 pt-8 text-sm">
                <div className="text-center">
                    <p className="pt-1 border-t border-black">Customer's Signature</p>
                </div>
                 <div className="text-center">
                    <p className="font-semibold">For {profile?.companyName}</p>
                    <p className="pt-1 border-t border-black mt-12">Authorised Signatory</p>
                </div>
            </div>
        </div>
    );
}
