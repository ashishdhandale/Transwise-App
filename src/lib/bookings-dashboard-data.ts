
import type { ItemRow } from "@/components/company/bookings/item-details-table";

export interface Booking {
  id: string;
  lrNo: string;
  bookingDate: string;
  fromCity: string;
  toCity: string;
  lrType: 'FOC' | 'PAID' | 'TOPAY' | 'TBB';
  sender: string;
  receiver: string;
  itemDescription: string;
  qty: number;
  chgWt: number;
  totalAmount: number;
  status: 'In Stock' | 'In Transit' | 'Cancelled' | 'In HOLD';
  itemRows: ItemRow[];
}

const LOCAL_STORAGE_KEY_BOOKINGS = 'transwise_bookings';

export const getBookings = (): Booking[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedBookings = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
        return savedBookings ? JSON.parse(savedBookings) : [];
    } catch (error) {
        console.error("Failed to load bookings from localStorage", error);
        return [];
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
