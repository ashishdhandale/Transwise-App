

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';


interface SearchPanelProps {
    onSearch: (id: string) => void;
}


export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [searchId, setSearchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchClick = () => {
    setIsLoading(true);
    onSearch(searchId);
    // Simulate a brief loading period for better UX
    setTimeout(() => setIsLoading(false), 300);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };


  return (
    <Card className="border-primary/30">
        <CardHeader className="p-4">
            <CardTitle className="text-lg font-headline">Find Your Package</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="flex items-center gap-2">
                <Input 
                    id="search-id" 
                    placeholder="LR No, Manual LR, or Tracking ID..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-11 text-base"
                    autoFocus
                />
                 <Button onClick={handleSearchClick} className="h-11" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    <span className="sr-only">Search</span>
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}

    
