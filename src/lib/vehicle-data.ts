
import type { VehicleMaster } from './types';

const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';

export const getVehicles = (): VehicleMaster[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
        return savedVehicles ? JSON.parse(savedVehicles) : [];
    } catch (error) {
        console.error("Failed to load vehicles from local storage", error);
        return [];
    }
};
