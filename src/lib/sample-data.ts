
import type { Customer } from './types';
import type { NewRequest, ExistingUser } from './user-management-types';
import type { Challan, LrDetail } from './challan-data';
import type { Booking } from './bookings-dashboard-data';
import { useEffect } from 'react';

// --- CUSTOMERS ---
export const initialCustomers: Customer[] = [];


// --- USER MANAGEMENT ---
export const newRequests: NewRequest[] = [];

export const existingUsers: ExistingUser[] = [];


// --- BOOKINGS ---
export const initialBookings: Booking[] = [];

// --- CHALLAN ---
export const initialChallanData: Challan[] = [];

export const initialLrDetailsData: LrDetail[] = [];
