
export interface Challan {
  challanId: string;
  dispatchDate: string;
  dispatchToParty: string;
  vehicleNo: string;
  driverName: string;
  fromStation: string;
  toStation: string;
  senderId: string;
  inwardId: string;
  inwardDate: string;
  receivedFromParty: string;
  challanType: 'Dispatch' | 'Inward';
  vehicleHireFreight: number;
  advance: number;
  balance: number;
  totalLr: number;
  totalPackages: number;
  totalItems: number;
  totalActualWeight: number;
  totalChargeWeight: number;
  summary: {
    grandTotal: number;
    totalTopayAmount: number;
    commission: number;
    labour: number;
    crossing: number;
    carting: number;
    balanceTruckHire: number;
    debitCreditAmount: number;
  };
}

export interface LrDetail {
  lrNo: string;
  lrType: 'TBB' | 'Topay' | 'PAID';
  sender: string;
  receiver: string;
  from: string;
  to: string;
  bookingDate: string;
  itemDescription: string;
  quantity: number;
  actualWeight: number;
  chargeWeight: number;
  grandTotal: number;
}


export const challanData: Challan[] = [
    {
        challanId: '123456789',
        dispatchDate: '21/07/2020',
        dispatchToParty: 'ABC Corp',
        vehicleNo: 'MH-40-KR-0643',
        driverName: 'Ramesh Patel',
        fromStation: 'Mumbai',
        toStation: 'Pune',
        senderId: 'SND-001',
        inwardId: 'INW-001',
        inwardDate: '21/07/2020',
        receivedFromParty: 'XYZ Inc',
        challanType: 'Dispatch',
        vehicleHireFreight: 5000,
        advance: 1000,
        balance: 4000,
        totalLr: 5,
        totalPackages: 50,
        totalItems: 100,
        totalActualWeight: 500,
        totalChargeWeight: 550,
        summary: {
            grandTotal: 25000,
            totalTopayAmount: 15000,
            commission: 500,
            labour: 300,
            crossing: 200,
            carting: 150,
            balanceTruckHire: 4000,
            debitCreditAmount: 0,
        }
    },
     {
        challanId: '987654321',
        dispatchDate: '22/07/2020',
        dispatchToParty: 'DEF Ltd',
        vehicleNo: 'GJ-05-AB-1234',
        driverName: 'Suresh Gupta',
        fromStation: 'Ahmedabad',
        toStation: 'Surat',
        senderId: 'SND-002',
        inwardId: 'INW-002',
        inwardDate: '22/07/2020',
        receivedFromParty: 'PQR Co',
        challanType: 'Dispatch',
        vehicleHireFreight: 4500,
        advance: 500,
        balance: 4000,
        totalLr: 8,
        totalPackages: 60,
        totalItems: 120,
        totalActualWeight: 700,
        totalChargeWeight: 720,
        summary: {
            grandTotal: 35000,
            totalTopayAmount: 20000,
            commission: 700,
            labour: 400,
            crossing: 100,
            carting: 200,
            balanceTruckHire: 4000,
            debitCreditAmount: 0,
        }
    }
];

export const lrDetailsData: LrDetail[] = [
    { lrNo: '32432', lrType: 'TBB', sender: 'Sender A', receiver: 'Receiver A', from: 'Mumbai', to: 'Pune', bookingDate: '20/07/2020', itemDescription: 'Electronics', quantity: 10, actualWeight: 100, chargeWeight: 110, grandTotal: 5000 },
    { lrNo: '23422', lrType: 'Topay', sender: 'Sender B', receiver: 'Receiver B', from: 'Mumbai', to: 'Pune', bookingDate: '20/07/2020', itemDescription: 'Textiles', quantity: 20, actualWeight: 150, chargeWeight: 150, grandTotal: 6000 },
    { lrNo: '56446', lrType: 'Topay', sender: 'Sender C', receiver: 'Receiver C', from: 'Mumbai', to: 'Pune', bookingDate: '21/07/2020', itemDescription: 'Machine Parts', quantity: 5, actualWeight: 80, chargeWeight: 80, grandTotal: 4000 },
    { lrNo: '8987707', lrType: 'PAID', sender: 'Sender D', receiver: 'Receiver D', from: 'Mumbai', to: 'Pune', bookingDate: '21/07/2020', itemDescription: 'Furniture', quantity: 10, actualWeight: 120, chargeWeight: 150, grandTotal: 7000 },
    { lrNo: '576575', lrType: 'Topay', sender: 'Sender E', receiver: 'Receiver E', from: 'Mumbai', to: 'Pune', bookingDate: '21/07/2020', itemDescription: 'Groceries', quantity: 5, actualWeight: 50, chargeWeight: 60, grandTotal: 3000 },
];
