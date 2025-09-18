
import type { Delivery, Vehicle } from './types';

const DELIVERIES_KEY = 'transwise_deliveries';
const VEHICLES_KEY = 'transwise_vehicles';

const sampleDeliveries: Delivery[] = [
  { id: 'DEL-001', customer: 'NOVA INDUSTERIES', destination: 'Pune', status: 'Pending', eta: '2024-07-30T14:00:00Z', timeWindowStart: '2024-07-30T12:00:00Z', timeWindowEnd: '2024-07-30T18:00:00Z', urgency: 'medium', size: 5 },
  { id: 'DEL-002', customer: 'MONIKA SALES', destination: 'Mumbai', status: 'In Transit', eta: '2024-07-29T18:30:00Z', timeWindowStart: '2024-07-29T15:00:00Z', timeWindowEnd: '2024-07-29T20:00:00Z', urgency: 'high', size: 12 },
  { id: 'DEL-003', customer: 'John Doe', destination: 'Delhi', status: 'Delivered', eta: '2024-07-28T11:00:00Z', timeWindowStart: '2024-07-28T09:00:00Z', timeWindowEnd: '2024-07-28T14:00:00Z', urgency: 'low', size: 2 },
  { id: 'DEL-004', customer: 'Jane Smith', destination: 'Bangalore', status: 'Delayed', eta: '2024-07-29T15:00:00Z', timeWindowStart: '2024-07-29T10:00:00Z', timeWindowEnd: '2024-07-29T14:00:00Z', urgency: 'high', size: 8 },
  { id: 'DEL-005', customer: 'PARTY NAME1', destination: 'Chennai', status: 'Pending', eta: '2024-07-31T12:00:00Z', timeWindowStart: '2024-07-31T10:00:00Z', timeWindowEnd: '2024-07-31T16:00:00Z', urgency: 'medium', size: 3 },
  { id: 'DEL-006', customer: 'Robert Brown', destination: 'Kolkata', status: 'Cancelled', eta: '2024-07-29T10:00:00Z', timeWindowStart: '2024-07-29T09:00:00Z', timeWindowEnd: '2024-07-29T12:00:00Z', urgency: 'low', size: 6 },
];

const sampleVehicles: Vehicle[] = [
  { id: 'VH-001', driver: 'Amit Patel', status: 'In Transit', location: { lat: 19.0760, lng: 72.8777, name: 'Near Mumbai' } },
  { id: 'VH-002', driver: 'Sunita Sharma', status: 'Idle', location: { lat: 21.1458, lng: 79.0882, name: 'Nagpur Warehouse' } },
  { id: 'VH-003', driver: 'Rajesh Kumar', status: 'Maintenance', location: { lat: 18.5204, lng: 73.8567, name: 'Pune Service Center' } },
  { id: 'VH-004', driver: 'Priya Singh', status: 'In Transit', location: { lat: 28.6139, lng: 77.2090, name: 'Approaching Delhi' } },
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
