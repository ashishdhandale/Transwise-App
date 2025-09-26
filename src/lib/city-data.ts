
import type { City } from './types';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';

export const getCities = (): City[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
        return savedCities ? JSON.parse(savedCities) : [];
    } catch (error) {
        console.error("Failed to load cities from local storage", error);
        return [];
    }
};
