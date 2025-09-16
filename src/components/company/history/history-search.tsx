
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface HistorySearchProps {
    onSearch: (id: string) => void;
    isLoading: boolean;
}

export function HistorySearch({ onSearch, isLoading }: HistorySearchProps) {
  const [searchId, setSearchId] = useState('');

  const handleSearchClick = () => {
    onSearch(searchId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline">Find Booking History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter LR / GR / Tracking ID..."
            className="flex-grow"
          />
          <Button onClick={handleSearchClick} disabled={isLoading || !searchId} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
