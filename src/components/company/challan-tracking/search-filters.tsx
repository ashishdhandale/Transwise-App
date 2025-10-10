

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search, X, Calendar as CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/ui/client-only';

type SearchCriterion = 'challanNo' | 'vehicleNo' | 'driver' | 'senderId' | 'date' | 'station';

const searchCriteria: { value: SearchCriterion; label: string }[] = [
  { value: 'challanNo', label: 'Challan No' },
  { value: 'vehicleNo', label: 'Vehicle No' },
  { value: 'driver', label: 'Driver' },
  { value: 'senderId', label: 'Sender ID' },
  { value: 'date', label: 'Date Range' },
  { value: 'station', label: 'Station' },
];

export function SearchFilters() {
  const [searchBy, setSearchBy] = useState<SearchCriterion>('challanNo');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const getPlaceholder = () => {
    if (searchBy === 'date') return 'Select a date range';
    const selectedCriterion = searchCriteria.find(c => c.value === searchBy);
    return `Search by ${selectedCriterion?.label}...`;
  };

  return (
    <Card className="p-4 border-primary/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            {/* Challan Type Filter */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Challan Type</Label>
                <RadioGroup defaultValue="all" className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="font-normal">ALL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dispatch" id="dispatch" />
                        <Label htmlFor="dispatch" className="font-normal">Dispatch</Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Main Search Area */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                    {/* Search Criteria */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="search-by" className="text-sm font-semibold">Search By</Label>
                        <Select value={searchBy} onValueChange={(value) => setSearchBy(value as SearchCriterion)}>
                            <SelectTrigger id="search-by">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {searchCriteria.map((criterion) => (
                                <SelectItem key={criterion.value} value={criterion.value}>
                                {criterion.label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Input / Date Picker */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="search-input" className="text-sm font-semibold">Value</Label>
                        {searchBy === 'date' ? (
                            <ClientOnly>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>Pick a date</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                            </ClientOnly>
                        ) : (
                            <Input id="search-input" placeholder={getPlaceholder()} />
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-end gap-2">
                    <Button className="w-full">
                        <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                    <Button variant="outline" className="w-full">
                        <X className="mr-2 h-4 w-4" /> Reset
                    </Button>
                </div>
            </div>
        </div>
    </Card>
  );
}
