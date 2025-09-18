

'use client';

import { Button } from '@/components/ui/button';
import { Save, Calculator, RefreshCw, X, FileX, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { CalculatorDialog } from './calculator-dialog';
import { useRouter } from 'next/navigation';

interface MainActionsSectionProps {
    onSave: () => void;
    isEditMode: boolean;
    onClose?: () => void;
    onReset?: () => void;
}

export function MainActionsSection({ onSave, isEditMode, onClose, onReset }: MainActionsSectionProps) {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const router = useRouter();

    const handleExit = () => {
        router.push('/company/bookings');
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <Button className="bg-green-600 hover:bg-green-700" onClick={onSave}>
                {isEditMode ? <RefreshCw className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {isEditMode ? 'Update Booking' : 'Save Booking'}
            </Button>
            
            {isEditMode ? (
                <Button variant="outline" onClick={onClose}>
                    <X className="mr-2 h-4 w-4" />
                    Exit Without Saving
                </Button>
            ) : (
                <>
                    <Button variant="outline" type="button" onClick={onReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Form
                    </Button>
                    <Button variant="destructive" type="button" onClick={handleExit}>
                        <FileX className="mr-2 h-4 w-4" />
                        Exit Without Saving
                    </Button>
                </>
            )}

            <Button variant="outline" onClick={() => setIsCalculatorOpen(true)} type="button">
                <Calculator className="mr-2 h-4 w-4" />
                Calculator
            </Button>
            <CalculatorDialog isOpen={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
        </div>
    );
}
