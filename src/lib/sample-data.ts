
import type { Customer, ExistingUser, OnlineInquiry } from './types';
import type { Challan, LrDetail } from './challan-data';
import type { Booking } from './bookings-dashboard-data';

// --- CUSTOMERS ---
export const initialCustomers: Customer[] = [];


// --- USER MANAGEMENT ---
export const onlineInquiries: OnlineInquiry[] = [
    { id: 1, name: 'Rakesh Sharma', contact: '9876543210', source: 'Website', message: 'I want to know more about your pricing for multi-branch companies.', status: 'New', date: '2024-07-28' },
    { id: 2, name: 'Priya Desai', contact: 'priya.desai@example.com', source: 'Facebook', message: 'Can I get a demo of the software?', status: 'Contacted', date: '2024-07-27' },
];

export const sampleExistingUsers: ExistingUser[] = [
    {
        id: 1,
        companyId: 'COMP01',
        subIds: 5,
        companyName: 'My Transwise Company',
        gstNo: '27ABCDE1234F1Z5',
        transporterId: 'T-12345',
        address: '123 Logistics Lane, Transport City, 440001',
        contactNo: '9876543210',
        licenceType: 'Gold',
        validTill: '2025-06-30',
        maxUsers: 10,
        maxBranches: 5,
        logo: true,
        state: 'Maharashtra',
        city: 'Nagpur',
        pan: 'ABCDE1234F',
        companyEmail: 'contact@transwise.com',
        authPersonName: 'Ankit Kumar',
        authContactNo: '9876543210',
        authEmail: 'contact@transwise.com'
    },
    {
        id: 2,
        companyId: 'COMP02',
        subIds: 2,
        companyName: 'Sharma Transports',
        gstNo: '29AAAAA0000A1Z5',
        transporterId: 'T-67890',
        address: '456 Freight Road, Mumbai',
        contactNo: '9988776655',
        licenceType: 'Bronze',
        validTill: '2024-12-31',
        maxUsers: 5,
        maxBranches: 2,
        logo: false,
        state: 'Maharashtra',
        city: 'Mumbai',
        pan: 'FGHIJ5678K',
        companyEmail: 'contact@sharmatrans.com',
        authPersonName: 'Ravi Sharma',
        authContactNo: '9988776655',
        authEmail: 'ravi@sharmatrans.com'
    },
     {
        id: 3,
        companyId: 'COMP03',
        subIds: 1,
        companyName: 'Quick Logistics',
        gstNo: '36BBBBB1111B1Z9',
        transporterId: 'T-54321',
        address: '789 Speedy St, Hyderabad',
        contactNo: '9123456789',
        licenceType: 'Trial',
        validTill: '2024-08-15',
        maxUsers: 2,
        maxBranches: 1,
        logo: true,
        state: 'Telangana',
        city: 'Hyderabad',
        pan: 'KLMNO9101L',
        companyEmail: 'info@quicklogistics.co',
        authPersonName: 'Sunita Reddy',
        authContactNo: '9123456789',
        authEmail: 'sunita@quicklogistics.co'
    }
];


// --- BOOKINGS ---
export const initialBookings: Booking[] = [];

// --- CHALLAN ---
export const initialChallanData: Challan[] = [];

export const initialLrDetailsData: LrDetail[] = [];
