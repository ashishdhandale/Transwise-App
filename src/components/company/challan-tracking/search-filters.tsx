
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

export function SearchFilters() {
  return (
    <Card className="p-4 border-primary/50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <RadioGroup defaultValue="all" className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">ALL</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dispatch" id="dispatch" />
            <Label htmlFor="dispatch">Dispatch Challan</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inward" id="inward" />
            <Label htmlFor="inward">Inward Challan</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <SearchInput placeholder="Search By Challan No" />
        <SearchInput placeholder="Search By Vehicle No" />
        <SearchInput placeholder="Search By Driver" />
        <SearchInput placeholder="Search By Sender ID" />
        <SearchInput placeholder="Search By Date" />
        <SearchInput placeholder="Search By Station" />
      </div>
    </Card>
  );
}

function SearchInput({ placeholder }: { placeholder: string }) {
    return (
        <div className="relative">
            <Input type="text" placeholder={placeholder} className="pr-8" />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-8 text-muted-foreground">
                <X className="h-4 w-4" />
            </Button>
        </div>
    )
}
