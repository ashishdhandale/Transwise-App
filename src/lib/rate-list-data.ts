

import type { RateList } from './types';

const LOCAL_STORAGE_KEY = 'transwise_rate_lists';

const initialRateLists: RateList[] = [
    {
        id: 1,
        name: 'Standard Rate List',
        isStandard: true,
        customerIds: [],
        stationRates: [
            { fromStation: 'Nagpur', toStation: 'Pune', rate: 12, rateOn: 'Chg.wt' },
            { fromStation: 'Nagpur', toStation: 'Mumbai', rate: 15, rateOn: 'Chg.wt' },
        ],
        itemRates: [
            { itemId: '1', rate: 100, rateOn: 'Quantity' }
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
