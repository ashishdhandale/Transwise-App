
'use client';

import { useState, useEffect } from 'react';
import { Truck, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleHireForm } from './vehicle-hire-form';
import { VehicleHireList } from './vehicle-hire-list';
import type { VehicleHireReceipt } from '@/lib/vehicle-hire-data';
import { getVehicleHireReceipts } from '@/lib/vehicle-hire-data';

export function VehicleHireDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [receipts, setReceipts] = useState<VehicleHireReceipt[]>([]);
  const [editingReceipt, setEditingReceipt] = useState<VehicleHireReceipt | null>(null);

  const loadReceipts = () => {
    setReceipts(getVehicleHireReceipts());
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleShowForm = () => {
    setEditingReceipt(null);
    setShowForm(true);
  };

  const handleEdit = (receipt: VehicleHireReceipt) => {
    setEditingReceipt(receipt);
    setShowForm(true);
  };
  
  const handleSuccess = () => {
      setShowForm(false);
      setEditingReceipt(null);
      loadReceipts();
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Vehicle Hire
        </h1>
        {!showForm && (
            <Button onClick={handleShowForm}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Hire Receipt
            </Button>
        )}
      </header>

      {showForm ? (
        <VehicleHireForm onSaveSuccess={handleSuccess} onCancel={() => setShowForm(false)} existingReceipt={editingReceipt} />
      ) : (
        <VehicleHireList receipts={receipts} onEdit={handleEdit} reloadReceipts={loadReceipts}/>
      )}
    </main>
  );
}
