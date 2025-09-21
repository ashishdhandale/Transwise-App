

import type { Customer } from './types';
import type { NewRequest, ExistingUser } from './user-management-types';
import type { Challan, LrDetail } from './challan-data';
import type { Booking } from './bookings-dashboard-data';
import { useEffect } from 'react';

// --- CUSTOMERS ---
export const initialCustomers: Customer[] = [
    { id: 1, name: 'NOVA INDUSTERIES', gstin: '27AAFCN0123A1Z5', address: '123, Industrial Area, Ahmedabad', mobile: '9876543210', email: 'contact@nova.com', type: 'Company', openingBalance: 0},
    { id: 2, name: 'MONIKA SALES', gstin: '22AAAAA0000A1Z5', address: '456, Trade Center, Mumbai', mobile: '9876543211', email: 'sales@monika.com', type: 'Individual', openingBalance: 0 },
    { id: 3, name: 'PARTY NAME1', gstin: '24ABCDE1234F1Z5', address: '789, Business Park, Pune', mobile: '9876543212', email: 'party1@example.com', type: 'Company', openingBalance: 0 },
    { id: 4, name: 'John Doe', gstin: '', address: '111 Oak Avenue, Delhi', mobile: '9988776655', email: 'john.doe@email.com', type: 'Individual', openingBalance: 0},
    { id: 5, name: 'Jane Smith', gstin: '29AABBC1234D1Z5', address: '222 Pine Street, Bangalore', mobile: '9988776644', email: 'jane.smith@email.com', type: 'Company', openingBalance: 0 },
    { id: 6, name: 'Robert Brown', gstin: '', address: '333 Maple Drive, Kolkata', mobile: '9988776633', email: 'robert.brown@email.com', type: 'Individual', openingBalance: 0 }
];


// --- USER MANAGEMENT ---
export const newRequests: NewRequest[] = Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    companyName: `New Company ${i + 1}`,
    gstNo: `27ABCDE1234F1Z${i}`,
    transporterId: `T${98765 + i}`,
    address: `${i + 1}0 Main St, Anytown`,
    contactNo: `987654321${i}`,
    licenceType: (['Trial', 'Bronze'] as const)[i % 2],
}));

export const existingUsers: ExistingUser[] = Array.from({ length: 23 }, (_, i) => ({
    id: i + 1,
    userId: `USR00${i + 1}`,
    subIds: i % 5,
    companyName: `Trans Co ${i + 1}`,
    gstNo: `29GHIJK5678L1Z${i}`,
    transporterId: `T${12345 + i}`,
    address: `${i * 2} Side St, Otherville`,
    contactNo: `888777666${i}`,
    totalIssuedIds: 5 + (i * 2),
    licenceType: (['Bronze', 'Gold', 'Platinum'] as const)[i % 3],
    validTill: `2025-0${(i%9)+1}-15`,
}));


// --- BOOKINGS ---
export const initialBookings: Booking[] = [
  {
    trackingId: 'TRK-1693892011123',
    lrNo: 'CONAG01',
    bookingDate: '2024-07-28T10:30:00.000Z',
    fromCity: 'Nagpur',
    toCity: 'Pune',
    lrType: 'PAID',
    loadType: 'PTL',
    sender: 'NOVA INDUSTERIES',
    receiver: 'MONIKA SALES',
    itemDescription: 'Electronic Components - 1 Box',
    qty: 1,
    chgWt: 50,
    totalAmount: 1200,
    status: 'In Stock',
    itemRows: [{
      id: 1, ewbNo: '', itemName: 'Electronics', description: '1 Box', qty: '1', actWt: '50', chgWt: '50', rate: '24', freightOn: 'Act.wt', lumpsum: '1200', pvtMark: '', invoiceNo: 'INV001', dValue: '50000'
    }]
  },
    {
    trackingId: 'TRK-1693892022234',
    lrNo: 'CONAG02',
    bookingDate: '2024-07-29T11:00:00.000Z',
    fromCity: 'Mumbai',
    toCity: 'Delhi',
    lrType: 'TOPAY',
    loadType: 'PTL',
    sender: 'MONIKA SALES',
    receiver: 'PARTY NAME1',
    itemDescription: 'Textile Rolls',
    qty: 10,
    chgWt: 250,
    totalAmount: 7500,
    status: 'In Stock',
    itemRows: [{
      id: 1, ewbNo: '', itemName: 'Textiles', description: '10 Rolls', qty: '10', actWt: '250', chgWt: '250', rate: '30', freightOn: 'Act.wt', lumpsum: '7500', pvtMark: '', invoiceNo: 'INV002', dValue: '150000'
    }]
  }
];

// --- CHALLAN ---
export const initialChallanData: Challan[] = [{
  challanId: 'CHLN001',
  dispatchDate: '2024-07-30',
  dispatchToParty: 'Delhi Hub',
  vehicleNo: 'MH-12-AB-1234',
  driverName: 'Ram Singh',
  fromStation: 'Mumbai',
  toStation: 'Delhi',
  senderId: 'MUM-S-01',
  inwardId: '',
  inwardDate: '',
  receivedFromParty: '',
  challanType: 'Dispatch',
  vehicleHireFreight: 15000,
  advance: 5000,
  balance: 10000,
  totalLr: 1,
  totalPackages: 10,
  totalItems: 1,
  totalActualWeight: 250,
  totalChargeWeight: 250,
  summary: {
    grandTotal: 7500,
    totalTopayAmount: 7500,
    commission: 0,
    labour: 500,
    crossing: 0,
    carting: 250,
    balanceTruckHire: 10000,
    debitCreditAmount: -2750,
  },
}];

export const initialLrDetailsData: LrDetail[] = [{
    challanId: 'CHLN001',
    lrNo: 'CONAG02',
    lrType: 'TOPAY',
    sender: 'MONIKA SALES',
    receiver: 'PARTY NAME1',
    from: 'Mumbai',
    to: 'Delhi',
    bookingDate: '2024-07-29',
    itemDescription: 'Textile Rolls',
    quantity: 10,
    actualWeight: 250,
    chargeWeight: 250,
    grandTotal: 7500,
}];
