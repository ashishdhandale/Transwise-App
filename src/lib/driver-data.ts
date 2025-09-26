
import type { Driver } from './types';

const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';

export const getDrivers = (): Driver[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
        return savedDrivers ? JSON.parse(savedDrivers) : [];
    } catch (error) {
        console.error("Failed to load drivers from local storage", error);
        return [];
    }
};
