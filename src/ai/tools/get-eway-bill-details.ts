
'use server';
/**
 * @fileOverview Defines an AI tool for fetching E-way Bill details.
 * This tool allows the AI model to retrieve information about an E-way Bill,
 * such as its validity and status, by calling an external service.
 */

import { ai } from '@/ai/genkit';
import { fetchEwayBillDetails } from '@/lib/ewb-service';
import { z } from 'genkit';

// Define the output schema for the E-way Bill details
const EwayBillDetailsSchema = z.object({
  ewbNo: z.string(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  vehicleNo: z.string(),
  fromPlace: z.string(),
  toPlace: z.string(),
  documentDate: z.string(),
  documentNo: z.string(),
});

export const getEwayBillDetails = ai.defineTool(
  {
    name: 'getEwayBillDetails',
    description: 'Get the details of an E-way Bill by its number. Returns null if not found.',
    inputSchema: z.object({ ewbNo: z.string().describe('The 12-digit E-way Bill number.') }),
    outputSchema: EwayBillDetailsSchema.nullable(),
  },
  async (input) => {
    console.log(`[AI Tool] getEwayBillDetails called with: ${input.ewbNo}`);
    return await fetchEwayBillDetails(input.ewbNo);
  }
);
