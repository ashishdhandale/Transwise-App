

'use client';

import type { Challan, LrDetail } from '@/lib/challan-data';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import type { ShortExtraEntry } from './ptl-challan-form';

interface LoadingSlipProps {
    challan: Challan;
    lrDetails: LrDetail[];
    profile: CompanyProfileFormValues;
    driverMobile?: string;
    remark: string;
    shortExtraMessages: ShortExtraEntry[];
}

const thClass = "text-left text-xs font-bold text-black border border-black";
const tdClass = "text-xs border border-black";

export function LoadingSlip({ challan, lrDetails, profile, driverMobile, remark, shortExtraMessages }: LoadingSlipProps) {

    const totalPackages = lrDetails.reduce((sum, lr) => sum + lr.quantity, 0);
    const totalWeight = lrDetails.reduce((sum, lr) => sum + lr.actualWeight, 0);
    const totalItems = lrDetails.length;

    return (
        <div className="p-4 font-sans text-black bg-white">
            <header className="text-center pb-2 space-y-1">
                <h1 className="text-lg font-bold">{profile.companyName}</h1>
                <p className="text-xs">{profile.headOfficeAddress}</p>
                <p className="text-sm font-bold underline">LOADING SLIP</p>
            </header>
            
            <div className="grid grid-cols-2 gap-x-4 text-xs border-y border-black py-2">
                <div>
                    <p><span className="font-semibold">Challan No:</span> {challan.challanId}</p>
                    <p><span className="font-semibold">From:</span> {challan.fromStation}</p>
                    <p><span className="font-semibold">To:</span> {challan.toStation}</p>
                </div>
                <div>
                    <p><span className="font-semibold">Date:</span> {challan.dispatchDate}</p>
                    <p><span className="font-semibold">Vehicle No:</span> {challan.vehicleNo}</p>
                    <p><span className="font-semibold">Driver:</span> {challan.driverName} {driverMobile && `(${driverMobile})`}</p>
                </div>
            </div>

            <div className="mt-2">
                <Table className="border-collapse border border-black">
                    <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>#</TableHead>
                            <TableHead className={thClass}>LR No</TableHead>
                            <TableHead className={thClass}>To</TableHead>
                            <TableHead className={thClass}>Consignee</TableHead>
                            <TableHead className={thClass}>Item & Description</TableHead>
                            <TableHead className={thClass}>Pkgs</TableHead>
                            <TableHead className={thClass}>Act. Wt.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lrDetails.map((lr, index) => (
                            <TableRow key={lr.lrNo}>
                                <TableCell className={tdClass}>{index + 1}</TableCell>
                                <TableCell className={tdClass}>{lr.lrNo}</TableCell>
                                <TableCell className={tdClass}>{lr.to}</TableCell>
                                <TableCell className={tdClass}>{lr.receiver}</TableCell>
                                <TableCell className={tdClass}>{lr.itemDescription}</TableCell>
                                <TableCell className={`${tdClass} text-center`}>{lr.quantity}</TableCell>
                                <TableCell className={`${tdClass} text-right`}>{lr.actualWeight.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold">
                            <TableCell colSpan={4} className={`${tdClass} text-right`}>TOTAL:</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalItems} Items</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalPackages}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{totalWeight.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="border border-black p-2">
                    <h3 className="font-bold underline text-xs mb-1">Remarks / Dispatch Note</h3>
                    <p className="text-xs min-h-[60px] whitespace-pre-line">{remark || 'No remarks.'}</p>
                </div>
                 <div className="border border-black p-2 space-y-1">
                    <h3 className="font-bold underline text-xs mb-1">Short / Extra Loading</h3>
                     {shortExtraMessages?.length > 0 ? (
                        <ul className="text-xs list-disc list-inside">
                            {shortExtraMessages.map(entry => (
                                <li key={entry.lrNo} className="text-destructive font-medium">{entry.message}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-center text-gray-500 min-h-[60px] flex items-center justify-center">No short/extra quantities noted.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 text-xs">
                <div className="text-center">
                    <p className="pt-1 border-t border-black">Driver Signature</p>
                </div>
                 <div className="text-center">
                    <p className="pt-1 border-t border-black">Loading Incharge</p>
                </div>
            </div>
        </div>
    );
}

    