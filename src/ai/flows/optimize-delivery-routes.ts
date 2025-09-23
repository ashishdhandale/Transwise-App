
'use server';

/**
 * @fileOverview A delivery route optimization AI agent.
 *
 * - optimizeDeliveryRoutes - A function that suggests optimized delivery routes based on real-time traffic, delivery schedules and other constraints.
 * - OptimizeDeliveryRoutesInput - The input type for the optimizeDeliveryRoutes function.
 * - OptimizeDeliveryRoutesOutput - The return type for the optimizeDeliveryRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeDeliveryRoutesInputSchema = z.object({
  deliveries: z
    .array(
      z.object({
        id: z.string().describe('The unique identifier for the delivery.'),
        location: z.string().describe('The delivery location.'),
        timeWindowStart: z.string().describe('The start of the delivery time window (ISO format).'),
        timeWindowEnd: z.string().describe('The end of the delivery time window (ISO format).'),
        urgency: z
          .enum(['high', 'medium', 'low'])
          .describe('The urgency of the delivery.'),
        size: z.number().describe('The size of the delivery (e.g., in cubic meters).'),
      })
    )
    .describe('A list of deliveries to be routed.'),
  vehicleCapacity: z.number().describe('The capacity of the vehicle in cubic meters.'),
  currentLocation: z.string().describe('The current location of the vehicle.'),
  trafficConditions: z
    .string()
    .optional()
    .describe('Real-time traffic conditions (e.g., from a traffic API).'),
  fuelPrice: z.number().optional().describe('Current fuel price.'),
});

export type OptimizeDeliveryRoutesInput = z.infer<
  typeof OptimizeDeliveryRoutesInputSchema
>;

const OptimizeDeliveryRoutesOutputSchema = z.object({
  optimizedRoutes: z
    .array(
      z.object({
        deliveryId: z.string().describe('The ID of the delivery.'),
        arrivalTime: z.string().describe('The estimated arrival time (ISO format).'),
        travelTime: z.number().describe('The estimated travel time in minutes.'),
        distance: z.number().describe('The distance to the delivery location in kilometers.'),
      })
    )
    .describe('The optimized delivery route.'),
  totalFuelConsumption: z
    .number()
    .optional()
    .describe('The estimated total fuel consumption for the route.'),
  totalTravelTime: z.number().describe('The estimated total travel time in minutes.'),
});

export type OptimizeDeliveryRoutesOutput = z.infer<
  typeof OptimizeDeliveryRoutesOutputSchema
>;

export async function optimizeDeliveryRoutes(
  input: OptimizeDeliveryRoutesInput
): Promise<OptimizeDeliveryRoutesOutput> {
  return optimizeDeliveryRoutesFlow(input);
}

const optimizeDeliveryRoutesPrompt = ai.definePrompt({
  name: 'optimizeDeliveryRoutesPrompt',
  input: {schema: OptimizeDeliveryRoutesInputSchema},
  output: {schema: OptimizeDeliveryRoutesOutputSchema},
  prompt: `You are a route optimization expert. Given the following deliveries, vehicle capacity, current location, and traffic conditions, suggest the most efficient delivery routes to minimize delays and fuel consumption.

Deliveries:
{{#each deliveries}}
- ID: {{this.id}}, Location: {{this.location}}, Time Window: {{this.timeWindowStart}} - {{this.timeWindowEnd}}, Urgency: {{this.urgency}}, Size: {{this.size}}
{{/each}}

Vehicle Capacity: {{vehicleCapacity}}
Current Location: {{currentLocation}}
Traffic Conditions: {{trafficConditions}}
Fuel Price: {{fuelPrice}}

Optimize the routes considering urgency, capacity and fuel savings. Return the optimized routes with estimated arrival times, travel times, and distances. Also, estimate total fuel consumption and total travel time.

Format the output as a JSON object with 'optimizedRoutes', 'totalFuelConsumption', and 'totalTravelTime' fields.
`,
});

const optimizeDeliveryRoutesFlow = ai.defineFlow(
  {
    name: 'optimizeDeliveryRoutesFlow',
    inputSchema: OptimizeDeliveryRoutesInputSchema,
    outputSchema: OptimizeDeliveryRoutesOutputSchema,
  },
  async input => {
    const {output} = await optimizeDeliveryRoutesPrompt(input);
    return output!;
  }
);
