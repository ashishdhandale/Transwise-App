
import type { RateList } from './types';

const LOCAL_STORAGE_KEY = 'transwise_rate_lists';

const initialRateLists: RateList[] = [
    {
        id: 1,
        name: 'Standard Rate List',
        stationRates: [
            { fromStation: 'Nagpur', toStation: 'Pune', rate: 1000 },
            { fromStation: 'Nagpur', toStation: 'Mumbai', rate: 1200 },
        ],
        kmRates: [
            { fromKm: 0, toKm: 100, ratePerKm: 10 },
            { fromKm: 101, toKm: 500, ratePerKm: 8 },
        ],
        truckRates: [
            { truckType: '14 FT', rate: 5000 },
            { truckType: '20 FT', rate: 8000 },
        ]
    }
];

export const getRateLists = (): RateList[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialRateLists));
        return initialRateLists;
    } catch (error) {
        console.error("Failed to load rate lists from local storage", error);
        return initialRateLists;
    }
};

export const saveRateLists = (rateLists: RateList[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rateLists));
    } catch (error) {
        console.error("Failed to save rate lists to localStorage", error);
    }
};
