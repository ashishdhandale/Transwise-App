
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { VehicleMaster } from '@/lib/types';
import { getVehicles } from '@/lib/vehicle-data';
import { AddExpenseForm } from './add-expense-form';
import { ExpenseList } from './expense-list';
import type { VehicleExpense } from '@/lib/vehicle-expenses-data';
import { getVehicleExpenses } from '@/lib/vehicle-expenses-data';

export function VehicleExpensesDashboard() {
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [allExpenses, setAllExpenses] = useState<VehicleExpense[]>([]);
    const [selectedVehicleNo, setSelectedVehicleNo] = useState<string | undefined>();

    const loadData = () => {
        setVehicles(getVehicles());
        setAllExpenses(getVehicleExpenses());
    }

    useEffect(() => {
        loadData();
    }, []);

    const vehicleOptions = useMemo(() => {
        return vehicles.map(v => ({ label: v.vehicleNo, value: v.vehicleNo }));
    }, [vehicles]);

    const filteredExpenses = useMemo(() => {
        if (!selectedVehicleNo) return [];
        return allExpenses
            .filter(e => e.vehicleNo === selectedVehicleNo)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allExpenses, selectedVehicleNo]);

    return (
        <main className="flex-1 p-4 md:p-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Wrench className="h-8 w-8" />
                    Vehicle Expenses
                </h1>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <AddExpenseForm vehicles={vehicles} onExpenseAdded={loadData} />
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardContent className="p-4">
                            <h3 className="text-lg font-semibold mb-4">Expense History</h3>
                            <div className="w-full max-w-sm mb-4">
                                <Combobox
                                    options={vehicleOptions}
                                    value={selectedVehicleNo}
                                    onChange={(value) => setSelectedVehicleNo(value)}
                                    placeholder="Select a vehicle to view its history..."
                                    searchPlaceholder="Search vehicles..."
                                    notFoundMessage="No vehicle found."
                                />
                            </div>
                            <ExpenseList expenses={filteredExpenses} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
