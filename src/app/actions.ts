
'use server';

import {
  optimizeDeliveryRoutes,
  type OptimizeDeliveryRoutesInput,
  type OptimizeDeliveryRoutesOutput,
} from '@/ai/flows/optimize-delivery-routes';
import {
  chat,
  type ChatInput,
  type ChatOutput
} from '@/ai/flows/chat-flow';
import { deliveries as allDeliveries } from '@/lib/data';

export type OptimizerState = {
  success: boolean;
  message?: string;
  data?: OptimizeDeliveryRoutesOutput;
};

export type ChatState = {
    success: boolean;
    message?: string;
    data?: ChatOutput;
}

export async function handleOptimizeRoute(
  prevState: OptimizerState,
  formData: FormData
): Promise<OptimizerState> {
  try {
    const selectedDeliveryIds = formData.getAll('deliveryIds') as string[];
    const currentLocation = formData.get('currentLocation') as string;
    const vehicleCapacity = Number(formData.get('vehicleCapacity'));

    if (selectedDeliveryIds.length === 0) {
      return { success: false, message: 'Please select at least one delivery.' };
    }
    if (!currentLocation) {
        return { success: false, message: 'Please provide a starting location.' };
    }
    if (!vehicleCapacity || vehicleCapacity <= 0) {
        return { success: false, message: 'Please provide a valid vehicle capacity.' };
    }

    const selectedDeliveries = allDeliveries.filter((d) =>
      selectedDeliveryIds.includes(d.id)
    );
    
    const totalSize = selectedDeliveries.reduce((acc, d) => acc + d.size, 0);
    if (totalSize > vehicleCapacity) {
        return { success: false, message: `Selected deliveries size (${totalSize}) exceeds vehicle capacity (${vehicleCapacity}).` };
    }

    const input: OptimizeDeliveryRoutesInput = {
      deliveries: selectedDeliveries.map((d) => ({
        id: d.id,
        location: d.destination,
        timeWindowStart: d.timeWindowStart,
        timeWindowEnd: d.timeWindowEnd,
        urgency: d.urgency,
        size: d.size,
      })),
      vehicleCapacity: vehicleCapacity,
      currentLocation: currentLocation,
    };

    const result = await optimizeDeliveryRoutes(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error optimizing route:', error);
    return { success: false, message: 'An unexpected error occurred while optimizing the route.' };
  }
}


export async function handleChat(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  try {
    const message = formData.get('message') as string;
    if (!message) {
      return { success: false, message: 'Please enter a message.' };
    }

    const input: ChatInput = { message };
    const result = await chat(input);

    return { success: true, data: result };
  } catch (error) {
    console.error('Error in chat:', error);
    return { success: false, message: 'An unexpected error occurred in the chat.' };
  }
}
