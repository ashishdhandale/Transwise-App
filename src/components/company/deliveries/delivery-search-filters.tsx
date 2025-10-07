
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search } from 'lucide-react';

interface DeliverySearchFiltersProps {
    onSearch: (filters: { query: string; type: 'All' | 'Dispatch' | 'Inward' }) => void;
}

export function DeliverySearchFilters({ onSearch }: DeliverySearchFiltersProps) {
    const [query, setQuery] = useState('');
    const [type, setType] = useState<'All' | 'Dispatch' | 'Inward'>('All');

    const handleSearch = () => {
        onSearch({ query, type });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Search Challan for Delivery</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label>Challan Type</Label>
                             <RadioGroup value={type} onValueChange={(v) => setType(v as any)} className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="All" id="all" />
                                    <Label htmlFor="all" className="font-normal">All</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Dispatch" id="dispatch" />
                                    <Label htmlFor="dispatch" className="font-normal">Dispatch</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Inward" id="inward" />
                                    <Label htmlFor="inward" className="font-normal">Inward</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="search-query">Search by Challan No, Vehicle No, Station...</Label>
                            <Input
                                id="search-query"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter search term..."
                            />
                        </div>
                    </div>
                    <Button onClick={handleSearch} className="w-full md:w-auto">
                        <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
