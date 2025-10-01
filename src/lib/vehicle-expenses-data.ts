
export interface VehicleExpense {
  id: number;
  vehicleNo: string;
  expenseType: 'Fuel' | 'Maintenance' | 'Parts' | 'Insurance' | 'Tyre Replacement' | 'Other';
  date: string;
  amount: number;
  description: string;
  vendor?: string;
  odometer?: number;
}

const EXPENSES_KEY = 'transwise_vehicle_expenses';

export const getVehicleExpenses = (): VehicleExpense[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveVehicleExpenses = (expenses: VehicleExpense[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};
