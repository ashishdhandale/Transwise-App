
import type { Vendor } from './types';

const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';

export const getVendors = (): Vendor[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedVendors = localStorage.getItem(LOCAL_STORAGE_KEY_VENDORS);
        return savedVendors ? JSON.parse(savedVendors) : [];
    } catch (error) {
        console.error("Failed to load vendors from local storage", error);
        return [];
    }
};

export const saveVendors = (vendors: Vendor[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_VENDORS, JSON.stringify(vendors));
    } catch (error) {
        console.error("Failed to save vendors to localStorage", error);
    }
}
