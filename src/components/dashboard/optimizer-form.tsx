
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleOptimizeRoute, type OptimizerState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Send } from 'lucide-react';
import { deliveries } from '@/lib/data';
import { OptimizerResults } from './optimizer-results';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Optimize Route
        </>
      )}
    </Button>
  );
}

const initialState: OptimizerState = {
  success: false,
};

export function OptimizerForm() {
  const [state, formAction] = useActionState(handleOptimizeRoute, initialState);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg font-headline">1. Select Deliveries</h3>
          <p className="text-sm text-muted-foreground">
            Choose pending deliveries to include in the route.
          </p>
          <ScrollArea className="h-72 rounded-md border p-4">
            <div className="space-y-4">
              {deliveries
                .filter((d) => d.status === 'Pending' || d.status === 'In Transit' || d.status === 'Delayed')
                .map((delivery) => (
                  <div key={delivery.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`delivery-${delivery.id}`}
                      name="deliveryIds"
                      value={delivery.id}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`delivery-${delivery.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {delivery.id} - {delivery.customer}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {delivery.destination} (Size: {delivery.size})
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
        
        <Separator />

        <div className="space-y-2">
            <h3 className="font-semibold text-lg font-headline">2. Set Parameters</h3>
            <p className="text-sm text-muted-foreground">
              Configure vehicle and starting point information.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="currentLocation">Starting Location</Label>
                    <Input
                        id="currentLocation"
                        name="currentLocation"
                        placeholder="e.g., Warehouse A, 123 Main St"
                        defaultValue="Main Warehouse, Chicago, IL"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="vehicleCapacity">Vehicle Capacity (cubic meters)</Label>
                    <Input
                        id="vehicleCapacity"
                        name="vehicleCapacity"
                        type="number"
                        placeholder="e.g., 20"
                        defaultValue="20"
                        required
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-4">
             <SubmitButton />
            {!state.success && state.message && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
        </div>
      </form>

      <div className="space-y-4">
         <h3 className="font-semibold text-lg font-headline">3. Optimized Route</h3>
         <OptimizerResults result={state.data} />
      </div>
    </div>
  );
}
