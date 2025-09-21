

import type { ItemRow } from "@/components/company/bookings/item-details-table";
import { initialBookings } from "./sample-data";

export interface FtlDetails {
  vehicleNo: string;
  driverName: string;
  lorrySupplier: string;
  truckFreight: number;
  advance: number;
  commission: number;
  otherDeductions: number;
}

export interface Booking {
  trackingId: string; // New unique internal ID
  lrNo: string;
  bookingDate: string;
  fromCity: string;
  toCity: string;
  lrType: 'FOC' | 'PAID' | 'TOPAY' | 'TBB';
  loadType: 'PTL' | 'FTL';
  paymentMode?: 'Cash' | 'Online';
  sender: string;
  receiver: string;
  itemDescription: string;
  qty: number;
  chgWt: number;
  totalAmount: number;
  status: 'In Stock' | 'In Transit' | 'Cancelled' | 'In HOLD' | 'Delivered';
  itemRows: ItemRow[];
  additionalCharges?: { [key: string]: number };
  taxPaidBy?: string;
  isGstApplicable?: boolean;
  ftlDetails?: FtlDetails;
}

const LOCAL_STORAGE_KEY_BOOKINGS = 'transwise_bookings';

export const getBookings = (): Booking[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedBookings = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
        if (savedBookings) {
            // Check if data needs migration
            const parsedBookings = JSON.parse(savedBookings);
            if (parsedBookings.length > 0 && !parsedBookings[0].trackingId) {
                const migratedBookings = parsedBookings.map((b: any) => ({
                    ...b,
                    trackingId: b.id || `TRK-${Date.now()}-${Math.random()}`
                }));
                saveBookings(migratedBookings);
                return migratedBookings;
            }
            return parsedBookings;
        }
        // If no data, initialize with sample data
        localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(initialBookings));
        return initialBookings;
    } catch (error) {
        console.error("Failed to load bookings from localStorage", error);
        return initialBookings;
    }
};

export const saveBookings = (bookings: Booking[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    } catch (error) {
        console.error("Failed to save bookings to localStorage", error);
    }
};
