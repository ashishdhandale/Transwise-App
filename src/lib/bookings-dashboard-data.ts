
export interface Booking {
  id: number;
  lrNo: string;
  fromCity: string;
  toCity: 'PAID' | 'TOPAY' | 'TBB';
  lrType: 'TO BE BILLED' | 'PAID' | 'FOC';
  sender: string;
  receiver: string;
  itemDescription: string;
  qty: number;
  chgWt: number;
  totalAmount: number;
  status: 'In Stock' | 'In Transit' | 'Cancelled' | 'In HOLD';
}

export const sampleBookings: Booking[] = [];
