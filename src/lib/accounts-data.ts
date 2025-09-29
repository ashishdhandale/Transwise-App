
import type { Booking } from './bookings-dashboard-data';
import { getBookings } from './bookings-dashboard-data';
import type { Customer } from './types';

export interface LedgerEntry {
  date: string;
  particulars: string;
  debit?: number;
  credit?: number;
  balance?: number;
}

export interface Voucher {
    type: 'Payment' | 'Receipt' | 'Journal';
    date: string;
    account: string;
    amount: number;
    narration: string;
}

const VOUCHER_STORAGE_KEY = 'transwise_vouchers';

export const getVouchers = (): Voucher[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(VOUCHER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export const addVoucher = (voucher: Voucher) => {
    if (typeof window === 'undefined') return;
    const vouchers = getVouchers();
    vouchers.push(voucher);
    localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(vouchers));
}


// In a real application, this data would come from a database.
const sampleCreditData: { [customerName: string]: LedgerEntry[] } = {};

// This function now dynamically generates the ledger from bookings.
export const getLedgerForCustomer = (customer: Customer): LedgerEntry[] => {
    const allBookings = getBookings();
    const allVouchers = getVouchers();

    const transactionEntries: LedgerEntry[] = [];

    allBookings.forEach((booking) => {
        const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-CA'); // YYYY-MM-DD
        
        // Logic for when the current customer is the SENDER
        if (booking.sender === customer.name) {
            if (booking.lrType === 'TBB') {
                // 'To Be Billed' creates a debit for the sender
                transactionEntries.push({
                    date: bookingDate,
                    particulars: `To Freight A/c - GR #${booking.lrNo}`,
                    debit: booking.totalAmount,
                });
            } else if (booking.lrType === 'PAID') {
                // 'PAID' is a cash transaction, record a single entry with no balance impact, but visible history.
                transactionEntries.push({
                    date: bookingDate,
                    particulars: `To Cash/Bank A/c - GR #${booking.lrNo}`,
                    debit: booking.totalAmount,
                    credit: booking.totalAmount,
                });
            }
            // 'TOPAY' and 'FOC' bookings do not create a debit for the sender
        } 
        // Logic for when the current customer is the RECEIVER
        else if (booking.receiver === customer.name) {
            // 'To Pay' creates a debit for the receiver
            if (booking.lrType === 'TOPAY') {
                transactionEntries.push({
                    date: bookingDate,
                    particulars: `To Freight A/c - GR #${booking.lrNo}`,
                    debit: booking.totalAmount,
                });
            }
        }
    });

    const openingBalance = customer.openingBalance ?? 0;

    const voucherEntries = allVouchers
        .filter(v => v.account === customer.name && v.type === 'Receipt')
        .map(v => ({
            date: new Date(v.date).toLocaleDateString('en-CA'),
            particulars: v.narration,
            credit: v.amount,
        }));


    const ledger: LedgerEntry[] = [
        { date: '2024-04-01', particulars: 'Opening Balance', balance: openingBalance },
        ...transactionEntries,
        ...voucherEntries
    ];

    // Sort entries by date
    ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Format date for display
    ledger.forEach(entry => {
        if(entry.date) {
            entry.date = new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'});
        }
    });

    return ledger;
};
