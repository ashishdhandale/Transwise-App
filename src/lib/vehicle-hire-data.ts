
export interface VehicleHireReceipt {
    id: number;
    receiptNo: string;
    date: string;
    supplierId: number;
    supplierName: string;
    vehicleNo: string;
    vehicleType?: string;
    driverName: string;
    driverMobile?: string;
    capacity?: number;
    overloadCapacity?: number;
    fromStation: string;
    toStation: string;
    freight: number;
    advance: number;
    balance: number;
    remarks?: string;
}

const VEHICLE_HIRE_KEY = 'transwise_vehicle_hire_receipts';

export const getVehicleHireReceipts = (): VehicleHireReceipt[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(VEHICLE_HIRE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveVehicleHireReceipts = (receipts: VehicleHireReceipt[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VEHICLE_HIRE_KEY, JSON.stringify(receipts));
};
