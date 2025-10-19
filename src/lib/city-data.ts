
import type { City } from './types';
import { bookingOptions } from './booking-data';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';

export const getCities = (): City[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    
    let allCities: City[] = [];
    const cityNames = new Set<string>();

    // 1. Add default system cities first
    bookingOptions.stations.forEach((stationName, index) => {
        if (!cityNames.has(stationName.toLowerCase())) {
            allCities.push({
                id: -(index + 1), // Use negative IDs to distinguish defaults
                name: stationName,
                aliasCode: stationName.substring(0, 3).toUpperCase(),
                pinCode: '', // Default cities won't have pincodes initially
            });
            cityNames.add(stationName.toLowerCase());
        }
    });

    // 2. Load and add custom cities from localStorage
    try {
        const savedCitiesJSON = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
        if (savedCitiesJSON) {
            const savedCities: City[] = JSON.parse(savedCitiesJSON);
            savedCities.forEach(city => {
                if (!cityNames.has(city.name.toLowerCase())) {
                    allCities.push(city);
                    cityNames.add(city.name.toLowerCase());
                }
            });
        }
    } catch (error) {
        console.error("Failed to load custom cities from local storage", error);
    }
    
    // Sort the final combined list alphabetically
    return allCities.sort((a, b) => a.name.localeCompare(b.name));
};
