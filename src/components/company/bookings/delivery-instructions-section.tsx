
'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';

const InstructionSelect = ({ label, options, defaultValue }: { label: string, options: { value: string, label: string }[], defaultValue: string }) => (
     <div className="grid grid-cols-[auto_1fr] items-center gap-2">
        <Label className="text-xs text-left">{label}</Label>
        <Select defaultValue={defaultValue}>
            <SelectTrigger className="h-7 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
        </Select>
    </div>
)

export function DeliveryInstructionsSection() {
  return (
    <Card className="p-2 border-cyan-200">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Delivery Instructions</h3>
        <div className="space-y-1.5">
            <InstructionSelect label="Insurance" options={bookingOptions.yesNo} defaultValue="No" />
            <InstructionSelect label="Delivery At" options={bookingOptions.deliveryAt} defaultValue="Godown Deli" />
            <InstructionSelect label="D.Point" options={bookingOptions.deliveryPoints} defaultValue="DWARKA COI" />
            <InstructionSelect label="POD?" options={bookingOptions.yesNo} defaultValue="No" />
            <InstructionSelect label="Attach CC" options={bookingOptions.yesNo} defaultValue="Yes" />
            <InstructionSelect label="Priority" options={bookingOptions.priorities} defaultValue="Express" />
            <InstructionSelect label="Print" options={bookingOptions.printFormats} defaultValue="Custom Copy" />
        </div>
    </Card>
  );
}
