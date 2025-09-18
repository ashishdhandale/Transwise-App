
export interface LedgerEntry {
  date: string;
  particulars: string;
  debit?: number;
  credit?: number;
  balance?: number;
}

// In a real application, this data would come from a database.
const sampleLedgers: { [customerId: number]: LedgerEntry[] } = {
  1: [ // NOVA INDUSTERIES
    { date: '2024-04-01', particulars: 'Opening Balance', balance: 50000 },
    { date: '2024-04-10', particulars: 'Goods - Inv #101', debit: 25000 },
    { date: '2024-04-15', particulars: 'Payment Received', credit: 30000 },
    { date: '2024-05-02', particulars: 'Goods - Inv #115', debit: 45000 },
    { date: '2024-05-20', particulars: 'Payment Received', credit: 50000 },
    { date: '2024-06-05', particulars: 'Credit Note #CN-05', credit: 5000 },
  ],
  2: [ // MONIKA SALES
    { date: '2024-04-01', particulars: 'Opening Balance', balance: -15000 }, // Credit balance
    { date: '2024-04-05', particulars: 'Advance Payment', credit: 20000 },
    { date: '2024-04-12', particulars: 'Goods - Inv #105', debit: 18000 },
    { date: '2024-05-18', particulars: 'Goods - Inv #121', debit: 22000 },
    { date: '2024-06-01', particulars: 'Payment Received', credit: 25000 },
  ],
  3: [ // PARTY NAME1
    { date: '2024-04-01', particulars: 'Opening Balance', balance: 0 },
    { date: '2024-06-15', particulars: 'Goods - Inv #130', debit: 100000 },
    { date: '2024-06-20', particulars: 'Payment Received', credit: 100000 },
  ],
};


export const getLedgerForCustomer = (customerId: number): LedgerEntry[] => {
    return sampleLedgers[customerId] || [{ date: '2024-04-01', particulars: 'Opening Balance', balance: 0 }];
};
