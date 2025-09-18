
'use client';

import type { OptimizeDeliveryRoutesOutput } from '@/ai/flows/optimize-delivery-routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, Droplet, MapPin, Milestone } from 'lucide-react';
import { deliveries } from '@/lib/data';
import { ClientOnly } from '../ui/client-only';

interface OptimizerResultsProps {
  result?: OptimizeDeliveryRoutesOutput;
}

function FormattedTime({ dateString }: { dateString: string }) {
  const time = new Date(dateString).toLocaleTimeString();
  return <>{time}</>;
}


export function OptimizerResults({ result }: OptimizerResultsProps) {
  if (!result) {
    return (
      <Card className="flex h-full items-center justify-center border-dashed">
        <div className="text-center text-muted-foreground">
          <Truck className="mx-auto h-12 w-12" />
          <p className="mt-2 font-medium">Your optimized route will appear here.</p>
          <p className="text-sm">Submit the form to generate a route.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Optimization Complete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Total Time</p>
              <p className="font-semibold">{result.totalTravelTime} mins</p>
            </div>
          </div>
          {result.totalFuelConsumption && (
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Fuel Est.</p>
                <p className="font-semibold">{result.totalFuelConsumption} L</p>
              </div>
            </div>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[26rem]">
          <div className="space-y-6 pr-4 relative">
             <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -z-10" />
            {result.optimizedRoutes.map((route, index) => {
              const delivery = deliveries.find(d => d.id === route.deliveryId);
              return (
                <div key={route.deliveryId} className="flex items-start gap-4">
                   <div className="flex-shrink-0 mt-1 size-8 bg-card border rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">{index + 1}</span>
                    </div>
                  <div className="flex-1">
                    <p className="font-semibold">{delivery?.customer}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="size-3" /> {delivery?.destination}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">
                          <Clock className="mr-1.5 size-3" />
                          Arrival: <ClientOnly><FormattedTime dateString={route.arrivalTime} /></ClientOnly>
                        </Badge>
                        <Badge variant="secondary"><Milestone className="mr-1.5 size-3" />{route.distance} km</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
