
import type { Customer } from './types';

const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';

export const getCustomers = (): Customer[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
        return savedCustomers ? JSON.parse(savedCustomers) : [];
    } catch (error) {
        console.error("Failed to load customers from local storage", error);
        return [];
    }
};
