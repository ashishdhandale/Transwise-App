
import type { Customer } from './types';
import type { NewRequest, ExistingUser } from './user-management-types';
import type { Challan, LrDetail } from './challan-data';
import type { Booking } from './bookings-dashboard-data';
import { useEffect } from 'react';

// --- CUSTOMERS ---
export const initialCustomers: Customer[] = [];


// --- USER MANAGEMENT ---
export const newRequests: NewRequest[] = [];

export const existingUsers: ExistingUser[] = [
    {
        id: 1,
        userId: 'CO101',
        subIds: 3,
        companyName: 'Transwise Solutions',
        gstNo: '27ABCDE1234F1Z5',
        transporterId: 'T-12345',
        address: '123 Tech Park, Silicon Valley',
        contactNo: '9876543210',
        totalIssuedIds: 5,
        licenceType: 'Platinum',
        validTill: '2025-12-31',
    }
];


// --- BOOKINGS ---
export const initialBookings: Booking[] = [];

// --- CHALLAN ---
export const initialChallanData: Challan[] = [];

export const initialLrDetailsData: LrDetail[] = [];
