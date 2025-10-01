
import type { Branch } from './types';

const LOCAL_STORAGE_KEY = 'transwise_branches';

const initialBranches: Branch[] = [
    { id: 'branch-1', name: 'Main Office', location: 'Nagpur, MH', companyId: '1' },
    { id: 'branch-2', name: 'Pune Hub', location: 'Pune, MH', companyId: '1' },
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
