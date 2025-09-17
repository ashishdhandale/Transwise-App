
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

export const sampleBookings: Booking[] = [];
