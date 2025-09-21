
import type { Booking } from './bookings-dashboard-data';
import { getBookings } from './bookings-dashboard-data';
import type { Vendor } from './types';
import type { LedgerEntry } from './accounts-data';

// In a real application, this data would come from a database.
const samplePaymentsToVendors: { [vendorName: string]: LedgerEntry[] } = {
  'Reliable Transports': [
    { date: '2024-07-20', particulars: 'Payment Made via NEFT', debit: 15000 },
  ],
};

const openingBalances: { [vendorName: string]: number } = {
    'Reliable Transports': 20000, // Opening credit (we owed them money)
};

// This function generates the ledger for vendors (payables).
export const getLedgerForVendor = (vendor: Vendor): LedgerEntry[] => {
    const allBookings = getBookings();

    const transactionEntries: LedgerEntry[] = [];

    allBookings.forEach((booking) => {
        // If the booking is FTL and the lorry supplier matches the selected vendor
        if (booking.loadType === 'FTL' && booking.ftlDetails?.lorrySupplier === vendor.name) {
            const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-CA'); // YYYY-MM-DD
            
            // The full truck freight is a credit to the vendor's account (money we owe them)
            transactionEntries.push({
                date: bookingDate,
                particulars: `By Truck Hire - GR #${booking.lrNo}`,
                credit: booking.ftlDetails.truckFreight,
            });

            // Any advance paid is a debit from the vendor's account (money we already gave them)
            if (booking.ftlDetails.advance > 0) {
                 transactionEntries.push({
                    date: bookingDate,
                    particulars: `To Advance Paid - GR #${booking.lrNo}`,
                    debit: booking.ftlDetails.advance,
                });
            }
        }
    });

    const openingBalance = openingBalances[vendor.name] ?? 0;

    const paymentEntries = samplePaymentsToVendors[vendor.name] || [];

    const ledger: LedgerEntry[] = [
        { date: '2024-04-01', particulars: 'Opening Balance', balance: openingBalance },
        ...transactionEntries,
        ...paymentEntries,
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
