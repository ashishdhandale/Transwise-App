
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="updateRates" />
                    <Label htmlFor="updateRates">Update Rates</Label>
                </div>
                <Textarea placeholder="Remark / Note: maximum 80 characherts" rows={4} maxLength={80} />
             </div>
             <div className="border rounded-md p-3 space-y-2 bg-gray-50">
                 <h4 className="font-bold text-blue-600 border-b pb-1">General Instruction :</h4>
                 <div>
                     <p className="font-semibold text-sm">Print Copy :</p>
                     <div className="flex flex-wrap gap-x-4 gap-y-1 pl-2">
                        <div className="flex items-center gap-1"><Checkbox defaultChecked id="printAll" /><Label htmlFor="printAll" className="font-normal text-sm">ALL</Label></div>
                        <div className="flex items-center gap-1"><Checkbox id="printCgnor" /><Label htmlFor="printCgnor" className="font-normal text-sm">C'gnor</Label></div>
                        <div className="flex items-center gap-1"><Checkbox id="printCgnee" /><Label htmlFor="printCgnee" className="font-normal text-sm">C'gnee</Label></div>
                        <div className="flex items-center gap-1"><Checkbox id="printDriver" /><Label htmlFor="printDriver" className="font-normal text-sm">Driver</Label></div>
                     </div>
                 </div>
                  <div>
                     <p className="font-semibold text-sm">Send Notification :</p>
                     <div className="flex flex-wrap gap-x-4 gap-y-1 pl-2">
                        <div className="flex items-center gap-1"><Checkbox defaultChecked id="notifSms" /><Label htmlFor="notifSms" className="font-normal text-sm">SMS</Label></div>
                        <div className="flex items-center gap-1"><Checkbox defaultChecked id="notifWhatsapp" /><Label htmlFor="notifWhatsapp" className="font-normal text-sm">Whats App</Label></div>
                        <div className="flex items-center gap-1"><Checkbox id="notifEmail" /><Label htmlFor="notifEmail" className="font-normal text-sm">Email</Label></div>
                        <div className="flex items-center gap-1"><Checkbox id="notifPayment" /><Label htmlFor="notifPayment" className="font-normal text-sm">Payment link</Label></div>
                     </div>
                 </div>
             </div>
        </div>
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
