
'use server';

/**
 * @fileOverview A mock service for fetching E-way Bill details.
 * In a real-world application, this service would make authenticated API calls
 * to the official GSTN E-way Bill portal.
 */

export interface EwayBillDetails {
  ewbNo: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  validFrom: string;
  validUntil: string;
  vehicleNo: string;
  fromPlace: string;
  toPlace: string;
  documentDate: string;
  documentNo: string;
}

/**
 * Simulates fetching E-way Bill details from the GSTN portal.
 * @param ewbNo The E-way Bill number to look up.
 * @returns A promise that resolves to the E-way Bill details or null if not found.
 */
export async function fetchEwayBillDetails(ewbNo: string): Promise<EwayBillDetails | null> {
  console.log(`[MockEwbService] Fetching details for EWB: ${ewbNo}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // In a real app, you'd have a database or an API call here.
  // We'll use a hardcoded map for this simulation.
  const mockDatabase: { [key: string]: EwayBillDetails } = {
    '121352547898': {
      ewbNo: '121352547898',
      status: 'ACTIVE',
      validFrom: '2024-07-30T00:00:00Z',
      validUntil: '2024-08-05T23:59:59Z',
      vehicleNo: 'MH-12-AB-1234',
      fromPlace: 'Mumbai, MH',
      toPlace: 'Delhi, DL',
      documentDate: '2024-07-29',
      documentNo: 'INV-001',
    },
    '251234567890': {
      ewbNo: '251234567890',
      status: 'EXPIRED',
      validFrom: '2024-07-01T00:00:00Z',
      validUntil: '2024-07-05T23:59:59Z',
      vehicleNo: 'GJ-01-XY-5678',
      fromPlace: 'Ahmedabad, GJ',
      toPlace: 'Jaipur, RJ',
      documentDate: '2024-06-30',
      documentNo: 'ABC-456',
    },
     '309876543210': {
      ewbNo: '309876543210',
      status: 'CANCELLED',
      validFrom: '2024-07-25T00:00:00Z',
      validUntil: '2024-07-30T23:59:59Z',
      vehicleNo: 'KA-05-MN-3456',
      fromPlace: 'Bangalore, KA',
      toPlace: 'Hyderabad, TS',
      documentDate: '2024-07-24',
      documentNo: 'XYZ-789',
    },
  };

  const result = mockDatabase[ewbNo] || null;

  if (result) {
    console.log(`[MockEwbService] Found details for ${ewbNo}:`, result);
  } else {
    console.log(`[MockEwbService] No details found for ${ewbNo}.`);
  }

  return result;
}
