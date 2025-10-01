
import type { Branch } from './types';

const LOCAL_STORAGE_KEY = 'transwise_branches';

const initialBranches: Branch[] = [
    { id: 'branch-1', name: 'Main Office', location: 'Nagpur, MH', companyId: '1', address: '123 Main St, Nagpur', city: 'Nagpur', state: 'MAHARASHTRA', contactNo: '9876543210', email: 'main@transwise.com', gstin: '27AAAAA0000A1Z5' },
    { id: 'branch-2', name: 'Pune Hub', location: 'Pune, MH', companyId: '1', address: '456 Hub Rd, Pune', city: 'Pune', state: 'MAHARASHTRA', contactNo: '9876543211', email: 'pune@transwise.com', gstin: '27AAAAA0000A1Z6' },
];

export const getBranches = (): Branch[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    // Initialize with default data if none exists
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialBranches));
    return initialBranches;
};

export const saveBranches = (branches: Branch[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(branches));
};
