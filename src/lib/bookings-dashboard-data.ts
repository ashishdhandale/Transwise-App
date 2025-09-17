
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

export const sampleBookings: Booking[] = [
  {
    id: 1,
    lrNo: 'COPNQ01',
    fromCity: 'PUNE',
    toCity: 'PAID',
    lrType: 'PAID',
    sender: 'ABC Electronics',
    receiver: 'Pune Retail',
    itemDescription: 'LED TV',
    qty: 10,
    chgWt: 150,
    totalAmount: 15000,
    status: 'In Stock',
  },
  {
    id: 2,
    lrNo: 'COBOM02',
    fromCity: 'MUMBAI',
    toCity: 'PAID',
    lrType: 'PAID',
    sender: 'Fashion Hub',
    receiver: 'Delhi Textiles',
    itemDescription: 'Garments',
    qty: 50,
    chgWt: 200,
    totalAmount: 25000,
    status: 'In Transit',
  },
  {
    id: 3,
    lrNo: 'COMAA03',
    fromCity: 'CHENNAI',
    toCity: 'TBB',
    lrType: 'TO BE BILLED',
    sender: 'Pharma Co',
    receiver: 'BLR Hospital',
    itemDescription: 'Medicines',
    qty: 25,
    chgWt: 50,
    totalAmount: 0,
    status: 'In Stock',
  },
  {
    id: 4,
    lrNo: 'COHYD04',
    fromCity: 'HYDERABAD',
    toCity: 'TOPAY',
    lrType: 'FOC',
    sender: 'Auto Parts Inc',
    receiver: 'Kolkata Motors',
    itemDescription: 'Spare Parts',
    qty: 100,
    chgWt: 500,
    totalAmount: 50000,
    status: 'In HOLD',
  },
   {
    id: 5,
    lrNo: 'COBLR05',
    fromCity: 'BANGALORE',
    toCity: 'PAID',
    lrType: 'PAID',
    sender: 'IT Solutions',
    receiver: 'Mumbai Corp',
    itemDescription: 'Laptops',
    qty: 20,
    chgWt: 80,
    totalAmount: 18000,
    status: 'In Transit',
  },
  {
    id: 6,
    lrNo: 'COPNQ06',
    fromCity: 'PUNE',
    toCity: 'TBB',
    lrType: 'TO BE BILLED',
    sender: 'Book Distrib.',
    receiver: 'Nagpur Uni',
    itemDescription: 'Textbooks',
    qty: 200,
    chgWt: 100,
    totalAmount: 8000,
    status: 'Cancelled',
  },
];
