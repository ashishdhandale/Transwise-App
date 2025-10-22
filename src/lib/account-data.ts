
import type { Account, AccountType } from './types';
import { getCustomers } from './customer-data';
import { getVendors } from './vendor-data';

const ACCOUNT_STORAGE_KEY = 'transwise_accounts';

export const getManualAccounts = (): Account[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return data ? JSON.parse(data) : [
        { id: 'account-1', name: 'CASH', type: 'Cash', openingBalance: 5000 },
        { id: 'account-2', name: 'BANK OF INDIA', type: 'Bank', openingBalance: 100000 },
        { id: 'account-3', name: 'TRUCK HIRE CHARGES', type: 'Expense', openingBalance: 0 },
        { id: 'account-4', name: 'SALARY', type: 'Expense', openingBalance: 0 },
    ];
};

export const saveAccounts = (accounts: Account[]) => {
    if (typeof window === 'undefined') return;
    const manualAccounts = accounts.filter(acc => acc.id.startsWith('account-'));
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(manualAccounts));
};

const groupAccounts = (accounts: Account[]) => {
    const groups: { [key in AccountType]?: Account[] } = {};
    accounts.forEach(account => {
        if (!groups[account.type]) {
            groups[account.type] = [];
        }
        groups[account.type]!.push(account);
    });
    return Object.entries(groups).map(([groupLabel, options]) => ({
        groupLabel,
        options: options.map(opt => ({ label: opt.name.toUpperCase(), value: opt.name })),
    }));
}


export const getAccounts = (): Account[] => {
    const manualAccounts = getManualAccounts();
    const customers: Account[] = getCustomers().map(c => ({
        id: `customer-${c.id}`,
        name: c.name,
        type: 'Customer',
        openingBalance: c.openingBalance,
        gstin: c.gstin,
        address: c.address,
        mobile: c.mobile,
        email: c.email,
    }));
    const vendors: Account[] = getVendors().map(v => ({
        id: `vendor-${v.id}`,
        name: v.name,
        type: 'Vendor',
        openingBalance: v.openingBalance,
        address: v.address,
        mobile: v.mobile,
        email: v.email,
    }));

    return [...manualAccounts, ...customers, ...vendors].sort((a, b) => a.name.localeCompare(b.name));
};

export const getGroupedAccounts = (accountTypes?: AccountType[]) => {
    let accounts = getAccounts();
    if(accountTypes) {
        accounts = accounts.filter(acc => accountTypes.includes(acc.type));
    }
    return groupAccounts(accounts);
}
