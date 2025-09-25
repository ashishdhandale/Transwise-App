
'use client';

import type { Challan, LrDetail } from '@/lib/challan-data';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

interface LoadingSlipProps {
    challan: Challan;
    lrDetails: LrDetail[];
    profile: CompanyProfileFormValues;
}

const thClass = "text-left text-xs font-bold text-black border border-black";
const tdClass = "text-xs border border-black";

export function LoadingSlip({ challan, lrDetails, profile }: LoadingSlipProps) {

    const totalPackages = lrDetails.reduce((sum, lr) => sum + lr.quantity, 0);
    const totalWeight = lrDetails.reduce((sum, lr) => sum + lr.actualWeight, 0);

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
                    <p><span className="font-semibold">Driver:</span> {challan.driverName}</p>
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
                                <TableCell className={`${tdClass} text-center`}>{lr.quantity}</TableCell>
                                <TableCell className={`${tdClass} text-right`}>{lr.actualWeight.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold">
                            <TableCell colSpan={3} className={`${tdClass} text-right`}>TOTAL:</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{lrDetails.length} LRs</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalPackages}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{totalWeight.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-20 text-xs">
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

