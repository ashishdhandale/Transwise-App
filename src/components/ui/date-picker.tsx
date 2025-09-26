
'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    disabled?: boolean;
}

export function DatePicker({ date, setDate, disabled }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    }
    
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-between text-left font-normal',
                        !date && 'text-muted-foreground'
                    )}
                    disabled={disabled}
                >
                    {date ? format(date, 'dd/MM/yyyy') : <span>Pick a date</span>}
                    <CalendarIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    disabled={disabled}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
