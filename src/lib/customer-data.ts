
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

export const saveCustomers = (customers: Customer[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
    } catch (error) {
        console.error("Failed to save customers to local storage", error);
    }
}
