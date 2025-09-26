
import type { Item } from './types';

const LOCAL_STORAGE_KEY_ITEMS = 'transwise_items';

export const getItems = (): Item[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
        return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
        console.error("Failed to load items from local storage", error);
        return [];
    }
};
