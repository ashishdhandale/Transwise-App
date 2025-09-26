
import type { Delivery, Vehicle } from './types';

const DELIVERIES_KEY = 'transwise_deliveries';
const VEHICLES_KEY = 'transwise_vehicles';

const sampleDeliveries: Delivery[] = [
  {
    id: 'DLV-001',
    customer: 'Acme Corp',
    destination: 'Springfield, IL',
    status: 'In Transit',
    eta: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
    timeWindowStart: new Date().toISOString(),
    timeWindowEnd: new Date(new Date().getTime() + 4 * 60 * 60 * 1000).toISOString(),
    urgency: 'medium',
    size: 5,
  },
  {
    id: 'DLV-002',
    customer: 'Globex Inc.',
    destination: 'Metropolis, NY',
    status: 'Pending',
    eta: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
    timeWindowStart: new Date().toISOString(),
    timeWindowEnd: new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toISOString(),
    urgency: 'low',
    size: 15,
  },
  {
    id: 'DLV-003',
    customer: 'Stark Industries',
    destination: 'Los Angeles, CA',
    status: 'Delivered',
    eta: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeWindowStart: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    timeWindowEnd: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: 'high',
    size: 2,
  },
    {
    id: 'DLV-004',
    customer: 'Wayne Enterprises',
    destination: 'Gotham City, NJ',
    status: 'Delayed',
    eta: new Date(new Date().getTime() - 1 * 60 * 60 * 1000).toISOString(),
    timeWindowStart: new Date(new Date().getTime() - 4 * 60 * 60 * 1000).toISOString(),
    timeWindowEnd: new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString(),
    urgency: 'high',
    size: 8,
  },
    {
    id: 'DLV-005',
    customer: 'Cyberdyne Systems',
    destination: 'Sunnyvale, CA',
    status: 'Pending',
    eta: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeWindowStart: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeWindowEnd: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: 'medium',
    size: 12,
  },
];

const sampleVehicles: Vehicle[] = [
  {
    id: 'TRK-101',
    driver: 'John Doe',
    status: 'In Transit',
    location: { lat: 41.8781, lng: -87.6298, name: 'Chicago Loop' },
  },
  {
    id: 'TRK-202',
    driver: 'Jane Smith',
    status: 'Idle',
    location: { lat: 41.9028, lng: 12.4964, name: 'Warehouse B, Rome' },
  },
  {
    id: 'TRK-303',
    driver: 'Mike Johnson',
    status: 'Maintenance',
    location: { lat: 34.0522, lng: -118.2437, name: 'LA Service Center' },
  },
];

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
