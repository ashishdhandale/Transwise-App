
export interface Booking {
  id: number;
  lrNo: string;
  bookingDate: string;
  fromCity: string;
  toCity: string;
  lrType: 'TO BE BILLED' | 'PAID' | 'FOC' | 'TOPAY' | 'TBB';
  sender: string;
  receiver: string;
  itemDescription: string;
  qty: number;
  chgWt: number;
  totalAmount: number;
  status: 'In Stock' | 'In Transit' | 'Cancelled' | 'In HOLD';
}

export const sampleBookings: Booking[] = [];
