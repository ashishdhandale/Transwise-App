

import type { ItemRow } from "@/components/company/bookings/item-details-table";
import { initialBookings } from "./sample-data";
import { getChallanData, getLrDetailsData } from "./challan-data";

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
  status: 'In Stock' | 'In Loading' | 'In Transit' | 'Cancelled' | 'In HOLD' | 'Delivered';
  dispatchStatus?: 'Short Dispatched' | 'Extra Dispatched';
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
            const parsedBookings: Booking[] = JSON.parse(savedBookings);

            // --- DATA MIGRATION & CORRECTION LOGIC ---
            const lrDetails = getLrDetailsData();
            const lrsOnChallan = new Set(lrDetails.map(lr => lr.lrNo));
            let dataWasCorrected = false;

            const correctedBookings = parsedBookings.map(booking => {
                // If a booking is "In Transit" but isn't on any challan, its status is wrong. Correct it.
                if ((booking.status === 'In Transit' || booking.status === 'In Loading') && !lrsOnChallan.has(booking.lrNo)) {
                    dataWasCorrected = true;
                    return { ...booking, status: 'In Stock' as const };
                }
                // Also handle migration for old data structures if needed
                if (!booking.trackingId) {
                    dataWasCorrected = true;
                    return { ...booking, trackingId: `TRK-${Date.now()}-${Math.random()}` };
                }
                return booking;
            });

            if (dataWasCorrected) {
                saveBookings(correctedBookings);
                return correctedBookings;
            }
            // --- END of MIGRATION LOGIC ---

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
