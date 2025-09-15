import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { vehicles } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';

const mapImage = PlaceHolderImages.find(img => img.id === 'map-background');

// Simple hash function to get a deterministic position
function getPosition(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = (hash & 0xffff) % 90 + 5; // 5% to 95%
  const y = ((hash >> 16) & 0xffff) % 90 + 5; // 5% to 95%
  return { top: `${y}%`, left: `${x}%` };
}

export function MapView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Real-Time Fleet</CardTitle>
        <CardDescription>Live locations of all active vehicles.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            {mapImage && (
              <Image
                src={mapImage.imageUrl}
                alt={mapImage.description}
                fill
                className="object-cover"
                data-ai-hint={mapImage.imageHint}
                priority
              />
            )}
            <div className="absolute inset-0 bg-black/10" />
            {vehicles.map((vehicle) => {
              const position = getPosition(vehicle.id);
              return (
                <Tooltip key={vehicle.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ top: position.top, left: position.left }}
                    >
                      <div className="relative">
                        <div
                          className={cn(
                            'h-3 w-3 rounded-full',
                            vehicle.status === 'In Transit'
                              ? 'bg-primary'
                              : vehicle.status === 'Idle'
                              ? 'bg-accent'
                              : 'bg-destructive'
                          )}
                        />
                         <div
                          className={cn(
                            'absolute inset-0 -z-10 h-3 w-3 animate-ping rounded-full',
                            vehicle.status === 'In Transit'
                              ? 'bg-primary'
                              : vehicle.status === 'Idle'
                              ? 'bg-accent/70'
                              : 'bg-destructive/70'
                          )}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex items-start gap-2 p-1">
                      <Truck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{vehicle.driver}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.id} - {vehicle.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          At: {vehicle.location.name}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
