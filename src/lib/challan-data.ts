

import type { CustomerData } from './bookings-dashboard-data';

export interface ChallanSummary {
  grandTotal: number;
  totalTopayAmount: number;
  commission: number;
  labour: number;
  crossing: number;
  carting: number;
  balanceTruckHire: number;
  debitCreditAmount: number;
  fuel?: number;
}

export interface Challan {
  challanId: string;
  dispatchDate: string;
  challanType: 'Dispatch' | 'Inward';
  status: 'Pending' | 'Finalized' | 'Cancelled';
  vehicleNo: string;
  driverName: string;
  fromStation: string;
  toStation: string;
  dispatchToParty: string;
  totalLr: number;
  totalPackages: number;
  totalItems: number;
  totalActualWeight: number;
  totalChargeWeight: number;
  vehicleHireFreight: number;
  advance: number;
  balance: number;
  senderId: string;
  inwardId: string;
  inwardDate: string;
  receivedFromParty: string;
  originalChallanNo?: string;
  summary: ChallanSummary;
  remark?: string;
  hireReceiptNo?: string;
  lorrySupplier?: string;
}

export interface LrDetail {
  challanId: string;
  lrNo: string;
  lrType: string;
  sender: CustomerData;
  receiver: CustomerData;
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

    
