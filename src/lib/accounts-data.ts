
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

// In a real application, this data would come from a database.
const sampleCreditData: { [customerName: string]: LedgerEntry[] } = {
  'NOVA INDUSTERIES': [
    { date: '2024-04-15', particulars: 'Payment Received', credit: 30000 },
    { date: '2024-05-20', particulars: 'Payment Received', credit: 50000 },
    { date: '2024-06-05', particulars: 'Credit Note #CN-05', credit: 5000 },
  ],
  'MONIKA SALES': [
    { date: '2024-04-05', particulars: 'Advance Payment', credit: 20000 },
    { date: '2024-06-01', particulars: 'Payment Received', credit: 25000 },
  ],
  'PARTY NAME1': [
    { date: '2024-06-20', particulars: 'Payment Received', credit: 100000 },
  ],
};

const openingBalances: { [customerName: string]: number } = {
    'NOVA INDUSTERIES': 50000,
    'MONIKA SALES': -15000,
    'PARTY NAME1': 0
};

// This function now dynamically generates the ledger from bookings.
export const getLedgerForCustomer = (customer: Customer): LedgerEntry[] => {
    const allBookings = getBookings();

    const customerBookings = allBookings.filter(
        (booking) => booking.sender === customer.name || booking.receiver === customer.name
    );

    const bookingEntries: LedgerEntry[] = [];
    customerBookings.forEach((booking) => {
        // Add the main freight charge
        bookingEntries.push({
            date: new Date(booking.bookingDate).toLocaleDateString('en-CA'), // YYYY-MM-DD
            particulars: `Freight - GR #${booking.lrNo}`,
            debit: booking.totalAmount,
        });

        // If tax was paid by the sender and this customer is the sender, add GST entry
        if (booking.taxPaidBy === 'Sender' && booking.sender === customer.name) {
             const basicFreight = booking.itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
             const additionalChargesTotal = Object.values(booking.additionalCharges || {}).reduce((sum, charge) => sum + charge, 0);
             const subTotal = basicFreight + additionalChargesTotal;
             const gstAmount = booking.totalAmount - subTotal;

             if (gstAmount > 0) {
                 bookingEntries.push({
                    date: new Date(booking.bookingDate).toLocaleDateString('en-CA'), // YYYY-MM-DD
                    particulars: `GST on GR #${booking.lrNo}`,
                    debit: gstAmount,
                 });
             }
        }
    });


    const openingBalance = openingBalances[customer.name] ?? 0;

    const creditEntries = sampleCreditData[customer.name] || [];

    const ledger: LedgerEntry[] = [
        { date: '2024-04-01', particulars: 'Opening Balance', balance: openingBalance },
        ...bookingEntries,
        ...creditEntries,
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
