'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY_PRINT = 'transwise_print_formats';

const InstructionSelect = ({ label, options, defaultValue, value, onChange }: { label: string, options: { value: string, label: string }[], defaultValue?: string, value?: string, onChange?: (value: string) => void }) => (
     <div className="grid grid-cols-[100px_1fr] items-center gap-2">
        <Label className="text-sm text-left">{label}</Label>
        <Select defaultValue={defaultValue} value={value} onValueChange={onChange}>
            <SelectTrigger className="h-7 text-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
        </Select>
    </div>
)

interface DeliveryInstructionsSectionProps {
    deliveryAt: string;
    onDeliveryAtChange: (value: string) => void;
}

export function DeliveryInstructionsSection({ deliveryAt, onDeliveryAtChange }: DeliveryInstructionsSectionProps) {
  const [printFormats, setPrintFormats] = useState<{ value: string, label: string }[]>(bookingOptions.printFormats);

  useEffect(() => {
    try {
        const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY_PRINT);
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed.formats && parsed.formats.length > 0) {
                const customFormats = parsed.formats.map((format: {id: string, name: string}) => ({
                    value: format.id,
                    label: format.name,
                }));
                // Keep "Standard" and add custom ones
                setPrintFormats([bookingOptions.printFormats[0], ...customFormats]);
            }
        }
    } catch (error) {
        console.error('Could not load custom print formats.', error);
    }
  }, []);

  const instructions = [
    { key: 'insurance', label: 'Insurance', options: bookingOptions.yesNo, defaultValue: 'No' },
    { key: 'pod', label: 'POD?', options: bookingOptions.yesNo, defaultValue: 'No' },
    { key: 'attachCc', label: 'Attach CC', options: bookingOptions.yesNo, defaultValue: 'Yes' },
    { key: 'priority', label: 'Priority', options: bookingOptions.priorities, defaultValue: 'Express' },
  ];

  return (
    <Card className="p-2 border-cyan-200 flex flex-col h-full">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Delivery Instructions</h3>
        <div className="space-y-1.5">
             <InstructionSelect 
                label="Delivery At" 
                options={bookingOptions.deliveryAt} 
                value={deliveryAt}
                onChange={onDeliveryAtChange}
            />
            {instructions.map(inst => (
                <InstructionSelect 
                    key={inst.key}
                    label={inst.label} 
                    options={inst.options} 
                    defaultValue={inst.defaultValue} 
                />
            ))}
             <InstructionSelect 
                label="Print" 
                options={printFormats} 
                defaultValue={printFormats[0]?.value}
            />
        </div>
        <Separator className="my-2" />
        <div className="flex-grow flex flex-col gap-1.5">
            <Label htmlFor="deliveryNote" className="text-sm text-left font-semibold">Delivery Note</Label>
            <Textarea id="deliveryNote" placeholder="Enter any notes for delivery..." className="flex-grow text-sm min-h-[50px]" />
        </div>
    </Card>
  );
}
