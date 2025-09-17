
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


export const challanData: Challan[] = [];

export const lrDetailsData: LrDetail[] = [];
