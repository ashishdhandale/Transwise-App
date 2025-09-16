'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function SearchPanel() {
  const [date, setDate] = useState<Date | undefined>(new Date('2014-10-03'));

  return (
    <div className="space-y-4">
      <Card className="border-gray-300">
        <CardHeader className="p-3">
          <CardTitle className="text-base font-bold">Search By Number</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="gr-number">GR Number</Label>
            <Input id="gr-number" />
          </div>
          <p className="text-center font-bold text-sm">OR</p>
          <div className="space-y-1">
            <Label htmlFor="tracking-id">Tracking ID</Label>
            <Input id="tracking-id" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-300">
        <CardHeader className="p-3">
          <CardTitle className="text-base font-bold">Search By Name</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="space-y-1">
            <Label>Dispatch Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-between text-left font-normal border-gray-300',
                    !date && 'text-muted-foreground'
                  )}
                >
                  {date ? format(date, 'dd / MM / yyyy') : <span>Pick a date</span>}
                  <CalendarIcon className="mr-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sender-name">Sender Name</Label>
            <Select>
              <SelectTrigger id="sender-name" className="border-gray-300">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sender1">Sender 1</SelectItem>
                <SelectItem value="sender2">Sender 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="receiver-name">Receiver Name</Label>
            <Select>
              <SelectTrigger id="receiver-name" className="border-gray-300">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receiver1">Receiver 1</SelectItem>
                <SelectItem value="receiver2">Receiver 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
