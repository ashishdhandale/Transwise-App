
'use client';

import { useState } from 'react';
import { History } from 'lucide-react';
import { HistorySearch } from './history-search';
import { HistoryLogDisplay } from './history-log-display';
import { historyData, type BookingHistory } from '@/lib/history-data';


export function HistoryTracking() {
  const [logs, setLogs] = useState<BookingHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedId, setSearchedId] = useState('');

  const handleSearch = (id: string) => {
    if (!id) {
        setLogs(null);
        setSearchedId('');
        return;
    };

    setIsLoading(true);
    setSearchedId(id);
    
    // Simulate API call to fetch logs
    setTimeout(() => {
        const foundLogs = historyData.find(item => item.id === id);
        setLogs(foundLogs || { id, logs: [] });
        setIsLoading(false);
    }, 1000);
  };


  return (
    <main className="flex-1 p-4 md:p-6 bg-secondary/50">
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <History className="h-8 w-8" />
                History Tracking
            </h1>
        </header>

        <div className="space-y-4">
            <HistorySearch onSearch={handleSearch} isLoading={isLoading} />
            <HistoryLogDisplay logs={logs} isLoading={isLoading} searchedId={searchedId} />
        </div>
    </main>
  );
}
