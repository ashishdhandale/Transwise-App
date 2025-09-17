'use client';

import { useState, useEffect } from 'react';
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
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SearchPanelProps {
    onSearch: (grNumber: string) => void;
}


export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [grNumber, setGrNumber] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the date is only set on the client, avoiding hydration mismatch.
    setDate(new Date('2014-10-03'));
    setIsClient(true);
  }, []);

  const handleSearchClick = () => {
    onSearch(grNumber);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };


  return (
    <Card className="border-gray-300">
        <CardHeader className="p-3 bg-primary text-primary-foreground rounded-t-md">
            <CardTitle className="text-base font-bold flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Package
            </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-4">
             {/* Search By Number */}
            <div>
                <Label htmlFor="gr-number" className="font-semibold">GR Number</Label>
                <Input 
                    id="gr-number" 
                    placeholder="Enter GR Number"
                    value={grNumber}
                    onChange={(e) => setGrNumber(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
            </div>
            
             <div>
                <Label htmlFor="tracking-id" className="font-semibold">Tracking ID</Label>
                <Input id="tracking-id" placeholder="Enter Tracking ID" />
            </div>

            <Separator />
            
            {/* Search By Name */}
             <div className="space-y-3">
                <h3 className="font-semibold text-center">Advanced Search</h3>
                <div className="space-y-2">
                    <Label>Dispatch Date</Label>
                    {isClient && (
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
                    )}
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
            </div>

            <Button className="w-full" onClick={handleSearchClick}>
                <Search className="mr-2 h-4 w-4" />
                Search
            </Button>
        </CardContent>
    </Card>
  );
}
