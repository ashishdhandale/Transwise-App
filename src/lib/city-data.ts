
import type { City } from './types';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';

// A more comprehensive initial list of cities with pincodes
const initialCitiesData: Omit<City, 'id'>[] = [
    { name: 'Mumbai', aliasCode: 'BOM', pinCode: '400001' },
    { name: 'Delhi', aliasCode: 'DEL', pinCode: '110001' },
    { name: 'Bengaluru', aliasCode: 'BLR', pinCode: '560001' },
    { name: 'Kolkata', aliasCode: 'CCU', pinCode: '700001' },
    { name: 'Chennai', aliasCode: 'MAA', pinCode: '600001' },
    { name: 'Hyderabad', aliasCode: 'HYD', pinCode: '500001' },
    { name: 'Pune', aliasCode: 'PNQ', pinCode: '411001' },
    { name: 'Ahmedabad', aliasCode: 'AMD', pinCode: '380001' },
    { name: 'Surat', aliasCode: 'STV', pinCode: '395001' },
    { name: 'Jaipur', aliasCode: 'JAI', pinCode: '302001' },
    { name: 'Lucknow', aliasCode: 'LKO', pinCode: '226001' },
    { name: 'Kanpur', aliasCode: 'KNU', pinCode: '208001' },
    { name: 'Nagpur', aliasCode: 'NAG', pinCode: '440001' },
    { name: 'Indore', aliasCode: 'IDR', pinCode: '452001' },
    { name: 'Thane', aliasCode: 'TNA', pinCode: '400601' },
    { name: 'Bhopal', aliasCode: 'BHO', pinCode: '462001' },
    { name: 'Visakhapatnam', aliasCode: 'VTZ', pinCode: '530001' },
    { name: 'Patna', aliasCode: 'PAT', pinCode: '800001' },
    { name: 'Vadodara', aliasCode: 'BDQ', pinCode: '390001' },
    { name: 'Ghaziabad', aliasCode: 'GZB', pinCode: '201001' },
    { name: 'Ludhiana', aliasCode: 'LUH', pinCode: '141001' },
    { name: 'Agra', aliasCode: 'AGR', pinCode: '282001' },
    { name: 'Nashik', aliasCode: 'ISK', pinCode: '422001' },
    { name: 'Faridabad', aliasCode: 'FDB', pinCode: '121001' },
    { name: 'Meerut', aliasCode: 'MEH', pinCode: '250001' },
    { name: 'Rajkot', aliasCode: 'RAJ', pinCode: '360001' },
    { name: 'Varanasi', aliasCode: 'VNS', pinCode: '221001' },
    { name: 'Srinagar', aliasCode: 'SXR', pinCode: '190001' },
    { name: 'Aurangabad', aliasCode: 'IXU', pinCode: '431001' },
    { name: 'Dhanbad', aliasCode: 'DBD', pinCode: '826001' },
    { name: 'Amritsar', aliasCode: 'ATQ', pinCode: '143001' },
    { name: 'Allahabad', aliasCode: 'IXD', pinCode: '211001' },
    { name: 'Ranchi', aliasCode: 'IXR', pinCode: '834001' },
    { name: 'Howrah', aliasCode: 'HWH', pinCode: '711101' },
    { name: 'Coimbatore', aliasCode: 'CJB', pinCode: '641001' },
    { name: 'Jabalpur', aliasCode: 'JLR', pinCode: '482001' },
    { name: 'Gwalior', aliasCode: 'GWL', pinCode: '474001' },
    { name: 'Vijayawada', aliasCode: 'VGA', pinCode: '520001' },
    { name: 'Jodhpur', aliasCode: 'JDH', pinCode: '342001' },
    { name: 'Madurai', aliasCode: 'IXM', pinCode: '625001' },
    { name: 'Raipur', aliasCode: 'RPR', pinCode: '492001' },
    { name: 'Kota', aliasCode: 'KTU', pinCode: '324001' },
];

// Helper function to create the initial list of cities with unique IDs
const createInitialCities = (): City[] => {
    return initialCitiesData.map((city, index) => ({
        id: index + 1,
        ...city,
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
