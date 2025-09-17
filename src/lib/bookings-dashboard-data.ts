
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
}

export const sampleBookings: Booking[] = [];
