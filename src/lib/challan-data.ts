
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

const CHALLAN_DATA_KEY = 'transwise_challan_data';
const LR_DETAILS_KEY = 'transwise_lr_details_data';


export const getChallanData = (): Challan[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CHALLAN_DATA_KEY);
    return data ? JSON.parse(data) : [];
}

export const saveChallanData = (data: Challan[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CHALLAN_DATA_KEY, JSON.stringify(data));
}

export const getLrDetailsData = (): LrDetail[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(LR_DETAILS_KEY);
    return data ? JSON.parse(data) : [];
}

export const saveLrDetailsData = (data: LrDetail[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LR_DETAILS_KEY, JSON.stringify(data));
}


export const challanData: Challan[] = [];
export const lrDetailsData: LrDetail[] = [];
