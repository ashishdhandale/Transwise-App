
import type { City } from './types';
import { bookingOptions } from './booking-data';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';

// Helper function to create the initial list of cities
const createInitialCities = (): City[] => {
    return bookingOptions.stations.map((name, index) => ({
        id: index + 1,
        name,
        aliasCode: name.substring(0, 3).toUpperCase(),
        pinCode: '', // Pincode can be added by the user
    }));
};

export const getCities = (): City[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    
    try {
        const savedCitiesJSON = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
        if (savedCitiesJSON) {
            const savedCities: City[] = JSON.parse(savedCitiesJSON);
            // Sort by name before returning
            return savedCities.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // If no data exists in localStorage, create it, save it, and return it.
            const initialCities = createInitialCities();
            localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(initialCities));
            return initialCities.sort((a, b) => a.name.localeCompare(b.name));
        }
    } catch (error) {
        console.error("Failed to load or initialize city data from local storage", error);
        // Fallback to in-memory initial list if localStorage fails
        return createInitialCities().sort((a, b) => a.name.localeCompare(b.name));
    }
};

export const saveCities = (cities: City[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(cities));
    } catch (error) {
        console.error("Failed to save cities to local storage", error);
    }
};
