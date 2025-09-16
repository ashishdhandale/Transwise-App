
'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';

const InstructionSelect = ({ label, options, defaultValue }: { label: string, options: { value: string, label: string }[], defaultValue: string }) => (
     <div className="grid grid-cols-2 items-center gap-4">
        <Label className="text-sm text-right">{label}</Label>
        <Select defaultValue={defaultValue}>
            <SelectTrigger className="h-8">
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
    <Card className="p-3 border-cyan-200">
        <h3 className="text-center font-semibold text-primary mb-2 border-b-2 border-dotted border-cyan-300 pb-1">Delivery Instructions</h3>
        <div className="space-y-2">
            <InstructionSelect label="Insurance ?" options={bookingOptions.yesNo} defaultValue="No" />
            <InstructionSelect label="Delivery At" options={bookingOptions.deliveryAt} defaultValue="Godown Deli" />
            <InstructionSelect label="Delivery Point" options={bookingOptions.deliveryPoints} defaultValue="DWARKA COI" />
            <InstructionSelect label="POD Required?" options={bookingOptions.yesNo} defaultValue="No" />
            <InstructionSelect label="Attach CC ?" options={bookingOptions.yesNo} defaultValue="Yes" />
            <InstructionSelect label="Priority ?" options={bookingOptions.priorities} defaultValue="Express" />
            <InstructionSelect label="Print Format" options={bookingOptions.printFormats} defaultValue="Custom Copy" />
        </div>
    </Card>
  );
}
