
'use client';

import { Button } from '@/components/ui/button';

const SummaryItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-center">
        <span className="font-semibold">{label} :</span>
        <span className="font-bold text-lg">{value}</span>
    </div>
);

export function SummaryAndActionsSection() {
  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
                <SummaryItem label="TOTAL ITEM" value={6} />
                <SummaryItem label="TOTAL QTY" value={400} />
                <SummaryItem label="TOTAL Act Wt" value={450} />
                <SummaryItem label="TOTAL Chg Wt" value={500} />
                <div className="border-t-2 border-dashed pt-2 mt-2">
                     <SummaryItem label="TOTAL Amount" value="Rs.1,234,56,789.00" />
                </div>
            </div>
             <div className="flex flex-col items-center gap-4">
                <h2 className="text-5xl font-extrabold text-green-600 tracking-wider">TOPAY</h2>
                <div className="flex gap-4">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">Save</Button>
                    <Button size="lg" variant="outline">RESET</Button>
                </div>
            </div>
        </div>
    </div>
  );
}
