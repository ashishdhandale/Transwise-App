
'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const InstructionSelect = ({ label, options, defaultValue }: { label: string, options: { value: string, label: string }[], defaultValue: string }) => (
     <div className="grid grid-cols-[100px_1fr] items-center gap-2">
        <Label className="text-sm text-left">{label}</Label>
        <Select defaultValue={defaultValue}>
            <SelectTrigger className="h-7 text-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
        </Select>
    </div>
)

export function DeliveryInstructionsSection() {
  const instructions = [
    { key: 'insurance', label: 'Insurance', options: bookingOptions.yesNo, defaultValue: 'No' },
    { key: 'deliveryAt', label: 'Delivery At', options: bookingOptions.deliveryAt, defaultValue: 'Godown Deliv' },
    { key: 'dpoint', label: 'D.Point', options: bookingOptions.deliveryPoints, defaultValue: 'DWARKA COI' },
    { key: 'pod', label: 'POD?', options: bookingOptions.yesNo, defaultValue: 'No' },
    { key: 'attachCc', label: 'Attach CC', options: bookingOptions.yesNo, defaultValue: 'Yes' },
    { key: 'priority', label: 'Priority', options: bookingOptions.priorities, defaultValue: 'Express' },
    { key: 'print', label: 'Print', options: bookingOptions.printFormats, defaultValue: 'Custom Copy' },
  ];

  return (
    <Card className="p-2 border-cyan-200 flex flex-col h-full">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Delivery Instructions</h3>
        <div className="space-y-1.5">
            {instructions.map(inst => (
                <div key={inst.key}>
                    <InstructionSelect 
                        label={inst.label} 
                        options={inst.options} 
                        defaultValue={inst.defaultValue} 
                    />
                </div>
            ))}
        </div>
        <Separator className="my-2" />
        <div className="flex-grow flex flex-col gap-1.5">
            <Label htmlFor="deliveryNote" className="text-sm text-left font-semibold">Delivery Note</Label>
            <Textarea id="deliveryNote" placeholder="Enter any notes for delivery..." className="flex-grow text-sm min-h-[50px]" />
        </div>
    </Card>
  );
}
