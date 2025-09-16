
export interface Booking {
  id: number;
  lrNo: string;
  fromCity: string;
  toCity: string;
  lrType: 'TO BE BILLED' | 'PAID' | 'FOC';
  sender: string;
  receiver: string;
  itemDescription: string;
  qty: number;
  chgWt: number;
  totalAmount: number;
  status: 'In Stock' | 'In Transit' | 'Cancelled' | 'In HOLD';
}

export const sampleBookings: Booking[] = [
  {
    id: 1,
    lrNo: '12345678910',
    fromCity: 'AHEMDABAD',
    toCity: 'GONDIA',
    lrType: 'TO BE BILLED',
    sender: '<-----15 Character--->',
    receiver: '<-----15 Character--->',
    itemDescription: '<--15 Character-->',
    qty: 99999,
    chgWt: 99999,
    totalAmount: 1234567,
    status: 'In Stock',
  },
  {
    id: 2,
    lrNo: '12345678910',
    fromCity: 'AHMADNAGAR',
    toCity: 'AHEMDABAD',
    lrType: 'TO BE BILLED',
    sender: '<-----15 Character--->',
    receiver: '<-----15 Character--->',
    itemDescription: '<--15 Character-->',
    qty: 99999,
    chgWt: 99999,
    totalAmount: 1234567,
    status: 'In Transit',
  },
  {
    id: 3,
    lrNo: '12345678910',
    fromCity: 'AHMADNAGAR',
    toCity: 'AHEMDABAD',
    lrType: 'TO BE BILLED',
    sender: '<-----15 Character--->',
    receiver: '<-----15 Character--->',
    itemDescription: '<--15 Character-->',
    qty: 99999,
    chgWt: 99999,
    totalAmount: 1234567,
    status: 'Cancelled',
  },
  {
    id: 4,
    lrNo: '12345678910',
    fromCity: 'AHMADNAGAR',
    toCity: 'AHEMDABAD',
    lrType: 'TO BE BILLED',
    sender: '<-----15 Character--->',
    receiver: '<-----15 Character--->',
    itemDescription: '<--15 Character-->',
    qty: 99999,
    chgWt: 99999,
    totalAmount: 1234567,
    status: 'In HOLD',
  },
];
