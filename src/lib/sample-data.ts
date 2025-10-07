
import type { Customer, ExistingUser, OnlineInquiry } from './types';
import type { Challan, LrDetail } from './challan-data';
import type { Booking } from './bookings-dashboard-data';
import { useEffect } from 'react';

// --- CUSTOMERS ---
export const initialCustomers: Customer[] = [];


// --- USER MANAGEMENT ---
export const onlineInquiries: OnlineInquiry[] = [
    { id: 1, name: 'Rohan Sharma', contact: 'rohan.s@example.com', source: 'Website', message: 'I need a quote for shipping from Nagpur to Pune.', status: 'New', date: new Date().toISOString() },
    { id: 2, name: 'Priya Patel', contact: '9876543210', source: 'Facebook', message: 'Do you offer FTL services?', status: 'Contacted', date: new Date().toISOString() },
];

export const sampleExistingUsers: ExistingUser[] = [
    {
        id: 1,
        userId: 'CO101',
        subIds: 3,
        companyName: 'Transwise Solutions',
        gstNo: '27ABCDE1234F1Z5',
        transporterId: 'T-12345',
        address: '123 Tech Park, Silicon Valley, CA',
        contactNo: '9876543210',
        licenceType: 'Platinum',
        validTill: '2025-12-31',
        maxUsers: 10,
        maxBranches: 5,
        logo: true,
        state: 'California',
        city: 'Mountain View',
        pan: 'ABCDE1234F',
        companyEmail: 'contact@transwise.com',
        authPersonName: 'Admin User',
        authContactNo: '9876543210',
        authEmail: 'admin@transwise.com',
    }
];


// --- BOOKINGS ---
export const initialBookings: Booking[] = [];

// --- CHALLAN ---
export const initialChallanData: Challan[] = [];

export const initialLrDetailsData: LrDetail[] = [];
