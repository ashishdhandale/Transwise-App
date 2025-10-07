
import type { Customer, ExistingUser, OnlineInquiry } from './types';
import type { Challan, LrDetail } from './challan-data';
import type { Booking } from './bookings-dashboard-data';

// --- CUSTOMERS ---
export const initialCustomers: Customer[] = [];


// --- USER MANAGEMENT ---
export const onlineInquiries: OnlineInquiry[] = [];

export const sampleExistingUsers: ExistingUser[] = [];


// --- BOOKINGS ---
export const initialBookings: Booking[] = [];

// --- CHALLAN ---
export const initialChallanData: Challan[] = [];

export const initialLrDetailsData: LrDetail[] = [];
