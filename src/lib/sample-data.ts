
import type { Customer } from './types';

type NewRequest = {
    id: number;
    companyName: string;
    gstNo: string;
    transporterId: string;
    address: string;
    contactNo: string;
    licenceType: "Trial" | "Bronze" | "Gold" | "Platinum";
};

type ExistingUser = {
    id: number;
    userId: string;
    subIds: number;
    companyName: string;
    gstNo: string;
    transporterId: string;
    address: string;
    contactNo: string;
    totalIssuedIds: number;
    licenceType: "Trial" | "Bronze" | "Gold" | "Platinum";
    validTill: string;
};

// Generate the data once and export it
export const newRequests: NewRequest[] = [];
export const existingUsers: ExistingUser[] = [];

export const initialCustomers: Customer[] = [
    { id: 1, name: 'NOVA INDUSTERIES', gstin: '27AAFCN0123A1Z5', address: '123, Industrial Area, Ahmedabad', mobile: '9876543210', email: 'contact@nova.com', type: 'Company'},
    { id: 2, name: 'MONIKA SALES', gstin: '22AAAAA0000A1Z5', address: '456, Trade Center, Mumbai', mobile: '9876543211', email: 'sales@monika.com', type: 'Individual' },
    { id: 3, name: 'PARTY NAME1', gstin: '24ABCDE1234F1Z5', address: '789, Business Park, Pune', mobile: '9876543212', email: 'party1@example.com', type: 'Company' },
];
