

'use client';

import { Button } from '@/components/ui/button';
import { Save, Calculator, RefreshCw, X, FileX, RotateCcw, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { CalculatorDialog } from './calculator-dialog';
import { useRouter } from 'next/navigation';

interface MainActionsSectionProps {
    onSave: () => void;
    isEditMode: boolean;
    onClose?: () => void;
    onReset?: () => void;
    isSubmitting: boolean;
    isViewOnly?: boolean;
}

export function MainActionsSection({ onSave, isEditMode, onClose, onReset, isSubmitting, isViewOnly }: MainActionsSectionProps) {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const router = useRouter();

    const handleExit = () => {
        if (onClose) {
            onClose();
        } else {
            router.push('/company/bookings');
        }
    };

    if (isViewOnly) {
        return (
            <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleExit} className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Close
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={onSave} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEditMode ? <RefreshCw className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Booking' : 'Save Booking')}
            </Button>
            
            {isEditMode ? (
                <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Exit Without Saving
                </Button>
            ) : (
                <>
                    <Button variant="outline" type="button" onClick={onReset} disabled={isSubmitting} className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Form
                    </Button>
                    <Button variant="destructive" type="button" onClick={() => router.push('/company/bookings')} disabled={isSubmitting} className="w-full">
                        <FileX className="mr-2 h-4 w-4" />
                        Exit Without Saving
                    </Button>
                </>
            )}

            <Button variant="outline" onClick={() => setIsCalculatorOpen(true)} type="button" disabled={isSubmitting} className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculator
            </Button>
            <CalculatorDialog isOpen={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
        </div>
    );
}
