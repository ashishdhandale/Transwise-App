
import type { Delivery, Vehicle } from './types';

const DELIVERIES_KEY = 'transwise_deliveries';
const VEHICLES_KEY = 'transwise_vehicles';

const sampleDeliveries: Delivery[] = [];

const sampleVehicles: Vehicle[] = [];

export const getDeliveries = (): Delivery[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(DELIVERIES_KEY);
    if (data) return JSON.parse(data);
    localStorage.setItem(DELIVERIES_KEY, JSON.stringify(sampleDeliveries));
    return sampleDeliveries;
};

export const getVehicles = (): Vehicle[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(VEHICLES_KEY);
    if (data) return JSON.parse(data);
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(sampleVehicles));
    return sampleVehicles;
};

export let deliveries: Delivery[] = [];
export let vehicles: Vehicle[] = [];

if (typeof window !== 'undefined') {
    deliveries = getDeliveries();
    vehicles = getVehicles();
}
