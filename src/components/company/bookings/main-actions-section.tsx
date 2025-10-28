
'use client';

import { Button } from '@/components/ui/button';
import { Save, Calculator, X, FileX, RotateCcw, Loader2, Plus, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { CalculatorDialog } from './calculator-dialog';
import { useRouter } from 'next/navigation';

interface MainActionsSectionProps {
    onSave: () => void;
    isEditMode: boolean;
    isPartialCancel?: boolean;
    onClose?: () => void;
    onReset?: () => void;
    isSubmitting: boolean;
    isViewOnly?: boolean;
    isForInward?: boolean;
}

export function MainActionsSection({ onSave, isEditMode, isPartialCancel, onClose, onReset, isSubmitting, isViewOnly, isForInward }: MainActionsSectionProps) {
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
    
    let saveButtonText: string;
    if (isPartialCancel) {
        saveButtonText = 'Confirm Cancellation';
    } else if (isEditMode) {
        saveButtonText = 'Update Booking (Ctrl+Alt+S)';
    } else if (isForInward) {
        saveButtonText = 'Add LR to List';
    } else {
        saveButtonText = 'Save Booking (Ctrl+Alt+S)';
    }

    let savingButtonText: string;
    if (isPartialCancel) {
        savingButtonText = 'Confirming...';
    } else if (isEditMode) {
        savingButtonText = 'Updating...';
    } else {
        savingButtonText = 'Saving...';
    }


    const mainButtonIcon = isEditMode || isPartialCancel ? <RefreshCcw className="mr-2 h-4 w-4" /> : isForInward ? <Plus className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />;
    
    return (
        <div className="flex flex-col gap-2">
            <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={onSave} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : mainButtonIcon}
                {isSubmitting ? savingButtonText : saveButtonText}
            </Button>
            
            {!isForInward && (
                <>
                    <Button variant="destructive" type="button" onClick={handleExit} disabled={isSubmitting} className="w-full">
                        <FileX className="mr-2 h-4 w-4" />
                        Exit Without Saving (Ctrl+Alt+E)
                    </Button>
                    
                    {onReset && !isEditMode && (
                        <Button variant="outline" type="button" onClick={onReset} disabled={isSubmitting} className="w-full">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset Form (Ctrl+Alt+R)
                        </Button>
                    )}
                </>
            )}


            {!isForInward && (
                <Button variant="outline" onClick={() => setIsCalculatorOpen(true)} type="button" disabled={isSubmitting} className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculator
                </Button>
            )}
            <CalculatorDialog isOpen={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
        </div>
    );
}

    