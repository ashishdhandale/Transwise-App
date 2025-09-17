
'use client';

import { Suspense, useState } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { History } from 'lucide-react';
import { HistorySearch } from '@/components/company/history/history-search';
import { HistoryLogDisplay } from '@/components/company/history/history-log-display';
import type { BookingHistory } from '@/lib/history-data';
import { getHistoryLogs } from '@/lib/history-data';

function HistoryReportPage() {
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
    
    // Simulate API call to fetch logs, in our case from localStorage
    setTimeout(() => {
        const allHistory = getHistoryLogs();
        const foundLogs = allHistory.find(item => item.id === id);
        setLogs(foundLogs || { id, logs: [] });
        setIsLoading(false);
    }, 500);
  };


  return (
    <main className="flex-1 p-4 md:p-6 bg-secondary/50">
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <History className="h-8 w-8" />
                History Report
            </h1>
        </header>

        <div className="space-y-4">
            <HistorySearch onSearch={handleSearch} isLoading={isLoading} />
            <HistoryLogDisplay logs={logs} isLoading={isLoading} searchedId={searchedId} />
        </div>
    </main>
  );
}


export default function HistoryRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <HistoryReportPage />
      </DashboardLayout>
    </Suspense>
  );
}
