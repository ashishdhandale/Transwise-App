
import type { Item } from './types';

const LOCAL_STORAGE_KEY_ITEMS = 'transwise_items';

const initialItems: Item[] = [
    { id: 1, name: 'BOX', aliasCode: 'BOX'},
    { id: 2, name: 'BAG', aliasCode: 'BAG'},
    { id: 3, name: 'BUNDLE', aliasCode: 'BDL'},
    { id: 4, name: 'CARTON', aliasCode: 'CTN'},
    { id: 5, name: 'DRUM', aliasCode: 'DRM'},
    { id: 6, name: 'ROLL', aliasCode: 'ROL'},
    { id: 7, name: 'BALE', aliasCode: 'BLE'},
    { id: 8, name: 'PALLET', aliasCode: 'PLT'},
    { id: 9, name: 'CASE', aliasCode: 'CSE'},
    { id: 10, name: 'CRATE', aliasCode: 'CRT'},
    { id: 11, name: 'PIECE', aliasCode: 'PC'},
    { id: 12, name: 'TIN', aliasCode: 'TIN'},
    { id: 13, name: 'CYLINDER', aliasCode: 'CYL'},
    { id: 14, name: 'LOOSE', aliasCode: 'LSE'},
    { id: 15, name: 'BARREL', aliasCode: 'BRL'},
];


export const getItems = (): Item[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
        if (savedItems) {
            return JSON.parse(savedItems);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(initialItems));
        return initialItems;
    } catch (error) {
        console.error("Failed to load items from local storage", error);
        return initialItems;
    }
};

export const saveItems = (items: Item[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (error) {
        console.error("Failed to save items to localStorage", error);
    }
}
