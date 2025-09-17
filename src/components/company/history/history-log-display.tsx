
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpenCheck, PackageCheck, Pencil, Plane, Ship, TramFront, Truck, User, Warehouse } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookingHistory, LogEntry } from '@/lib/history-data';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoryLogDisplayProps {
    logs: BookingHistory | null;
    isLoading: boolean;
    searchedId: string;
}

const getIconForAction = (action: LogEntry['action']) => {
    switch (action) {
        case 'Booking Created': return <BookOpenCheck className="size-5 text-primary" />;
        case 'Booking Updated': return <Pencil className="size-5 text-yellow-600" />;
        case 'Dispatched from Warehouse': return <Warehouse className="size-5 text-blue-600" />;
        case 'In Transit': return <Truck className="size-5 text-gray-600" />;
        case 'Arrived at Hub': return <Plane className="size-5 text-indigo-600" />;
        case 'Out for Delivery': return <User className="size-5 text-cyan-600" />;
        case 'Delivered': return <PackageCheck className="size-5 text-green-600" />;
        default: return <TramFront className="size-5 text-muted-foreground" />;
    }
}

export function HistoryLogDisplay({ logs, isLoading, searchedId }: HistoryLogDisplayProps) {
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
  }
    
  if (!logs) {
    return (
      <Card className="flex h-64 items-center justify-center border-dashed">
        <div className="text-center text-muted-foreground">
          <Ship className="mx-auto h-12 w-12" />
          <p className="mt-2 font-medium">Enter an ID to see its history.</p>
        </div>
      </Card>
    );
  }

  if (logs.logs.length === 0) {
      return (
         <Card className="flex h-64 items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground">
                <p className="font-medium text-lg">No history found for ID: <span className="font-bold text-primary">{searchedId}</span></p>
                <p>Please check the ID and try again.</p>
            </div>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline">
          History for ID: <span className="text-primary font-bold">{logs.id}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="relative pl-6">
             <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-border -z-10" />
             {logs.logs.map((log, index) => (
                <div key={index} className="relative flex items-start gap-4 mb-6">
                    <div className="absolute left-0 top-0 flex items-center justify-center size-9 bg-card border-2 rounded-full z-10">
                        {getIconForAction(log.action)}
                    </div>
                    <div className="flex-1 ml-12">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-base">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{log.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">User: {log.user}</p>
                    </div>
                </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
